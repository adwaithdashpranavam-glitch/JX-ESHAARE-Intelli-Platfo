/* * Developer: Cave Arnold
 * AI Assistant: Gemini
 * Date: January 29, 2026
 * Version: 1.0.0
 *
 * ===========================================================================================
 * APPLICATION: BLS CPI Data Scraper
 * ===========================================================================================
 * * OVERVIEW:
 * This application automates the extraction of Consumer Price Index (CPI) data from the 
 * U.S. Bureau of Labor Statistics website (https://www.bls.gov/cpi/latest-numbers.htm).
 * It utilizes Microsoft Playwright to bypass bot detection mechanisms, extracts specific
 * inflation metrics (NSA/SA Monthly & Yearly), and persists them to a SQL Server database.
 * * KEY FEATURES:
 * - Persistent Context: Maintains browser cookies/session to bypass CAPTCHA on repeat runs.
 * - Global Text Search: Scrapes visible text rather than relying on fragile HTML IDs.
 * - Serilog Integration: Writes all output to rolling log files in the /Logs directory.
 * - Database Upsert: Prevents duplicate entries using a smart stored procedure.
 * * DEPENDENCIES:
 * - Microsoft.Playwright
 * - Microsoft.Data.SqlClient
 * - Serilog
 * - Serilog.Sinks.File
 * * SETUP INSTRUCTIONS:
 * 1. Ensure SQL LocalDB is running and the 'Guyton-Klinger-Withdrawals' database exists.
 * 2. Run 'playwright install chromium' to download the browser binaries.
 * 3. On the first run, if a CAPTCHA appears, solve it manually in the pop-up window.
 * ===========================================================================================
 */

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using Microsoft.Playwright;
using Microsoft.Data.SqlClient;
using System.Data;
using System.IO;
using Serilog;

namespace CPIScraper
{
    class Program
    {
        private static readonly string ConnectionString = @"Server=(localdb)\MSSQLLocalDB;Database=Guyton-Klinger-Withdrawals;Trusted_Connection=True;Encrypt=False;";
        private static readonly string Url = "https://www.bls.gov/cpi/latest-numbers.htm";
        private static readonly string UserDataPath = Path.Combine(Environment.CurrentDirectory, "PlaywrightUserContext");
        private static readonly string LogPath = Path.Combine(Environment.CurrentDirectory, "Logs", "scraper_log.txt");

        static async Task Main(string[] args)
        {
            // 1. Configure Serilog to write ONLY to a file (rolling interval daily)
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Information()
                .WriteTo.File(LogPath, rollingInterval: RollingInterval.Day)
                .CreateLogger();

            Log.Information("--- BLS CPI Scraper Started ---");

            try
            {
                var result = await ScrapeWithStealthPlaywright();

                if (result != null && result.IsPopulated())
                {
                    Log.Information("Data Extraction Successful.");
                    Log.Information("Report Month: {ReportMonth}", result.NSA_Monthly_Date);
                    Log.Information("NSA Monthly: {Val} (in {Date})", result.NSA_Monthly_Val, result.NSA_Monthly_Date);
                    Log.Information("SA Monthly: {Val} (in {Date})", result.SA_Monthly_Val, result.SA_Monthly_Date);
                    Log.Information("NSA Yearly: {Val} (since {Date})", result.NSA_Yearly_Val, result.NSA_Yearly_Since_Date);

                    SaveToDatabase(result);
                }
                else
                {
                    Log.Warning("Scrape finished but data was incomplete or could not be parsed.");
                }
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Critical Application Error");
            }
            finally
            {
                Log.Information("--- BLS CPI Scraper Finished ---");
                Log.CloseAndFlush();
            }
        }

        private static async Task<CPIData> ScrapeWithStealthPlaywright()
        {
            using var playwright = await Playwright.CreateAsync();

            if (!Directory.Exists(UserDataPath)) Directory.CreateDirectory(UserDataPath);

            var launchOptions = new BrowserTypeLaunchPersistentContextOptions
            {
                Headless = false,
                ViewportSize = new ViewportSize { Width = 1280, Height = 1024 },
                UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
                Args = new[] { "--disable-blink-features=AutomationControlled" }
            };

            await using var context = await playwright.Chromium.LaunchPersistentContextAsync(UserDataPath, launchOptions);
            var page = context.Pages.Count > 0 ? context.Pages[0] : await context.NewPageAsync();
            await page.AddInitScriptAsync("delete Object.getPrototypeOf(navigator).webdriver;");

            Log.Information("Navigating to BLS Website: {Url}", Url);
            await page.GotoAsync(Url, new PageGotoOptions { WaitUntil = WaitUntilState.NetworkIdle, Timeout = 90000 });

            Log.Information("Waiting for 'CPI Latest Numbers' text...");
            try
            {
                await page.WaitForSelectorAsync("text=CPI Latest Numbers", new PageWaitForSelectorOptions { Timeout = 45000 });
            }
            catch (Exception ex)
            {
                // Capture screenshot on error for debugging
                var errorImgPath = Path.Combine(Environment.CurrentDirectory, "Logs", "timeout_error.png");
                await page.ScreenshotAsync(new PageScreenshotOptions { Path = errorImgPath });
                Log.Error(ex, "Timeout waiting for selector. Screenshot saved to {Path}", errorImgPath);
                throw;
            }

            var allPageText = await page.InnerTextAsync("body");
            var lines = allPageText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries)
                                   .Select(l => l.Trim())
                                   .ToList();

            int startIndex = lines.FindIndex(l => l.Contains("All Items", StringComparison.OrdinalIgnoreCase));
            if (startIndex == -1)
            {
                Log.Error("Could not find 'All Items' anchor text in page content.");
                throw new Exception("Could not find 'All Items' section.");
            }

            var chunkLines = lines.Skip(startIndex).Take(50);
            string combinedBlock = string.Join(" ", chunkLines);

            Log.Information("Parsing data block...");

            var data = new CPIData();

            // 1. NSA Monthly
            var nsaMatch = Regex.Match(combinedBlock, @"\bNSA\s+(?<val>unchanged|[\+\-]?\d+\.\d+%)\s+in\s+(?<date>[A-Z][a-z]{2}\s+\d{4})");
            if (nsaMatch.Success)
            {
                data.NSA_Monthly_Val = nsaMatch.Groups["val"].Value;
                data.NSA_Monthly_Date = nsaMatch.Groups["date"].Value;
            }

            // 2. SA Monthly
            var saMatch = Regex.Match(combinedBlock, @"\bSA\s+(?<val>unchanged|[\+\-]?\d+\.\d+%)\s+in\s+(?<date>[A-Z][a-z]{2}\s+\d{4})");
            if (saMatch.Success)
            {
                data.SA_Monthly_Val = saMatch.Groups["val"].Value;
                data.SA_Monthly_Date = saMatch.Groups["date"].Value;
            }

            // 3. NSA Yearly
            var yearMatch = Regex.Match(combinedBlock, @"\bNSA\s+(?<val>unchanged|[\+\-]?\d+\.\d+%)\s+since\s+(?<date>[A-Z][a-z]{2}\s+\d{4})");
            if (yearMatch.Success)
            {
                data.NSA_Yearly_Val = yearMatch.Groups["val"].Value;
                data.NSA_Yearly_Since_Date = yearMatch.Groups["date"].Value;
            }

            return data;
        }

        private static void SaveToDatabase(CPIData data)
        {
            Log.Information("Attempting database upsert for ReportMonth: {Month}", data.NSA_Monthly_Date);

            try
            {
                using SqlConnection conn = new SqlConnection(ConnectionString);
                using SqlCommand cmd = new SqlCommand("dbo.usp_UpsertCPILatest", conn);

                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ReportMonth", data.NSA_Monthly_Date);
                cmd.Parameters.AddWithValue("@NSA_Val", data.NSA_Monthly_Val ?? "N/A");
                cmd.Parameters.AddWithValue("@NSA_Date", data.NSA_Monthly_Date ?? "N/A");
                cmd.Parameters.AddWithValue("@SA_Val", data.SA_Monthly_Val ?? "N/A");
                cmd.Parameters.AddWithValue("@SA_Date", data.SA_Monthly_Date ?? "N/A");
                cmd.Parameters.AddWithValue("@Yearly_Val", data.NSA_Yearly_Val ?? "N/A");
                cmd.Parameters.AddWithValue("@Yearly_Since_Date", data.NSA_Yearly_Since_Date ?? "N/A");
                cmd.Parameters.AddWithValue("@UpdateDate", DateTime.Now);

                conn.Open();
                int rowsAffected = cmd.ExecuteNonQuery();
                Log.Information("Database updated successfully. Rows affected: {Rows}", rowsAffected);
            }
            catch (Exception ex)
            {
                Log.Error(ex, "Database operation failed.");
                throw;
            }
        }
    }

    public class CPIData
    {
        public string NSA_Monthly_Val { get; set; }
        public string NSA_Monthly_Date { get; set; }

        public string SA_Monthly_Val { get; set; }
        public string SA_Monthly_Date { get; set; }

        public string NSA_Yearly_Val { get; set; }
        public string NSA_Yearly_Since_Date { get; set; }

        public bool IsPopulated() =>
            !string.IsNullOrEmpty(NSA_Monthly_Date) &&
            !string.IsNullOrEmpty(NSA_Monthly_Val) &&
            !string.IsNullOrEmpty(SA_Monthly_Val) &&
            !string.IsNullOrEmpty(NSA_Yearly_Since_Date);
    }
}
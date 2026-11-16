# BLS CPI Data Scraper

## Overview
This windows application automates the retrieval of the latest Consumer Price Index (CPI) data from the [U.S. Bureau of Labor Statistics (BLS)](https://www.bls.gov/cpi/latest-numbers.htm). It uses a "stealth" browser automation approach (Playwright) to bypass government bot detection, parses the latest monthly and yearly inflation figures, and stores them in a local SQL Server database.

## Features
* **Stealth Scraping:** Uses Microsoft Playwright with a Persistent Context to mimic a real user session, effectively bypassing 403 Forbidden errors and CAPTCHA challenges.
* **Resilient Parsing:** Implements a global text search and regex strategy to handle inconsistent HTML layouts and line breaks on the BLS website.
* **Precise Data Extraction:** Captures:
    * NSA (Not Seasonally Adjusted) Monthly Change & Date
    * SA (Seasonally Adjusted) Monthly Change & Date
    * NSA Yearly Change & "Since" Date
* **Database Integration:** Upserts data into a SQL Server database, ensuring only the latest version of the data for a given month is stored.
* **File-Only Logging:** Uses Serilog to write detailed logs to a daily rolling file (`Logs/scraper_log.txt`), keeping the console clean for scheduled task execution.

## Prerequisites
* **.NET 6.0 SDK** (or later)
* **SQL Server** (LocalDB or Standard)
* **PowerShell / Terminal** (for initial setup)

## Installation

1.  **Clone/Download** the repository.
2.  **Install Dependencies:**
    Run the following command in the project directory:
    ```bash
    dotnet add package Microsoft.Playwright
    dotnet add package Microsoft.Data.SqlClient
    dotnet add package Serilog
    dotnet add package Serilog.Sinks.File
    ```
3.  **Install Playwright Browsers:**
    ```bash
    dotnet build
    pwsh bin/Debug/net6.0/playwright.ps1 install chromium
    ```
4.  **Database Setup:**
    Execute the SQL scripts provided in `DatabaseScripts.sql` to create the `CPILatestNumbers` table and `usp_UpsertCPILatest` stored procedure.


    * All the required database schema objects can be created using the DDL kept in this GitHub repository: [Guyton-Klinger-Withdrawals](https://github.com/CaveArnold/Guyton-Klinger-Withdrawals)

## Usage

1.  **Update Connection String:**
    Open `Program.cs` and ensure `ConnectionString` points to your target database.
2.  **Run the Application:**
    ```bash
    dotnet run
    ```
    * *First Run Note:* If a CAPTCHA ("Press and Hold") appears, the browser window will open (`Headless = false` is default). Solve it manually. The application will remember your session for future runs.
3.  **Logs:**
    Check the `Logs` folder in the application directory for execution details.

## Troubleshooting
* **Timeout / Element Not Found:** Check `Logs/timeout_error.png` to see what the browser saw at the time of failure.
* **Access Denied:** Ensure `Headless = false` is set in `Program.cs` and run manually once to clear the BLS "human check".

## License

This project is licensed under the [GPL-3.0 License](LICENSE.txt).
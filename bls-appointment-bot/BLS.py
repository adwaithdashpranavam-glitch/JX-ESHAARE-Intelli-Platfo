#!/usr/bin/env python3
"""BLS Algeria Booking Simulator & Safe Integration Template.

Reconstructed file. The originally uploaded BLS.py was truncated mid-file;
everything above the ``except FileNotFoundError:`` handler was missing. The
missing pieces (imports, constants, BLSRecord, generate/check handlers and the
booking stubs) were rebuilt so the documented CLI works end-to-end in
simulation mode. The CLI section below the truncation point is the original
uploaded code, unchanged.
"""

import argparse
import logging
import random
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import date, timedelta

from colorama import Fore, Style, init

APP_NAME = "BLS Algeria Booking Simulator"
GENERATED_FILE = "bls_records.txt"
VALID_OUTPUT_FILE = "booked_sim.txt"
LOG_FILE = "bls_simulator.log"

REAL_INTEGRATION_ENABLED = False

init(autoreset=True)

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
)

BANNER = r"""
+-----------------------------------------------------+
|        BLS   ALGERIA   BOOKING   SIMULATOR          |
|          (safe / offline simulation mode)           |
+-----------------------------------------------------+
"""


def banner():
    print(Fore.CYAN + BANNER + Style.RESET_ALL)
    print(Fore.CYAN + f"== {APP_NAME} ==" + Style.RESET_ALL)
    print(Fore.YELLOW + "Simulation mode. No real bookings are made unless a real "
          "integration is explicitly implemented and enabled." + Style.RESET_ALL)


@dataclass
class BLSRecord:
    code: str
    expiry: str
    ref: str
    balance: int

    def to_line(self):
        return f"{self.code}|{self.expiry}|{self.ref}|${self.balance}"

    @classmethod
    def from_line(cls, line):
        code, expiry, ref, bal = line.split("|")
        return cls(code, expiry, ref, int(bal.lstrip("$")))


# ---------------------------
# Record generation (simulation)
# ---------------------------
def handle_generate(args):
    start = date(args.start_year, 1, 1)
    records = []
    for _ in range(args.count):
        code = f"BLS-{random.randint(100000, 999999)}"
        expiry = (start + timedelta(days=random.randint(0, 730))).isoformat()
        ref = f"REF{random.randint(10000, 99999)}"
        balance = random.choice([0, 25, 50, 90, 120])
        records.append(BLSRecord(code, expiry, ref, balance))
    with open(GENERATED_FILE, "w", encoding="utf-8") as fh:
        for record in records:
            fh.write(record.to_line() + "\n")
    print(Fore.GREEN + f"Generated {len(records)} records into {GENERATED_FILE}" + Style.RESET_ALL)


def check_record(record):
    try:
        expired = date.fromisoformat(record.expiry) < date.today()
    except ValueError:
        expired = True
    return record, (not expired and record.balance > 0)


# ---------------------------
# Record checking (simulation, multi-threaded)
# ---------------------------
def handle_simulate_check(args):
    input_file = args.input or GENERATED_FILE
    try:
        with open(input_file, "r", encoding="utf-8") as fh:
            lines = [ln.strip() for ln in fh if ln.strip()]
    except FileNotFoundError:
        print(Fore.RED + "Input file not found. Generate records first or provide a file path." + Style.RESET_ALL)
        return

    records = [BLSRecord.from_line(ln) for ln in lines]
    valid = []
    workers = max(1, args.threads)
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for record, ok in pool.map(check_record, records):
            if ok:
                valid.append(record)

    print(Fore.GREEN + f"Checked {len(records)} records with {workers} threads: "
          f"{len(valid)} valid, {len(records) - len(valid)} invalid" + Style.RESET_ALL)
    for record in valid[:10]:
        print(Fore.CYAN + f"  VALID {record.code} expiry={record.expiry} ref={record.ref} bal=${record.balance}" + Style.RESET_ALL)
    if len(valid) > 10:
        print(Fore.CYAN + f"  ... and {len(valid) - 10} more" + Style.RESET_ALL)


# ---------------------------
# Booking integration
# ---------------------------
def real_book_request(record, user_data=None):
    if not REAL_INTEGRATION_ENABLED:
        raise RuntimeError("Real integration is disabled (REAL_INTEGRATION_ENABLED=False).")
    raise NotImplementedError("Implement the real BLS booking API call here.")


def real_book_request_simulation_placeholder(record, user_data=None):
    if random.random() < 0.5:
        return {"status": "success", "appointment_id": f"APT-{random.randint(100000, 999999)}"}
    return {"status": "failure", "message": "No slots available (simulation)."}


def handle_attempt_book(args):
    input_file = args.input or GENERATED_FILE
    try:
        with open(input_file, "r", encoding="utf-8") as fh:
            lines = [ln.strip() for ln in fh if ln.strip()]
    except FileNotFoundError:
        print(Fore.RED + "Input file not found. Generate records first or provide a file path." + Style.RESET_ALL)
        return
    # For demonstration, we'll attempt N random records
    sample = random.sample(lines, min(args.attempts, len(lines)))
    for ln in sample:
        parts = ln.split('|')
        code, expiry, ref, bal = parts[0], parts[1], parts[2], parts[3].lstrip('$')
        record = BLSRecord(code, expiry, ref, int(bal))
        print(Fore.MAGENTA + f"\n=== Attempting booking for {record.code} (simulated) ===" + Style.RESET_ALL)
        if REAL_INTEGRATION_ENABLED and args.use_real:
            try:
                resp = real_book_request(record, user_data={})
                print(Fore.GREEN + f"Real integration response: {resp}" + Style.RESET_ALL)
            except Exception as e:
                print(Fore.RED + f"Real integration failed or disabled: {e}" + Style.RESET_ALL)
        else:
            resp = real_book_request_simulation_placeholder(record, user_data={})
            if resp.get("status") == "success":
                print(Fore.GREEN + f"Simulated booking success: appointment id {resp.get('appointment_id')}" + Style.RESET_ALL)
                with open(VALID_OUTPUT_FILE, 'a', encoding='utf-8') as vf:
                    vf.write(f"BOOKED_SIM|{resp.get('appointment_id')}|{record}\n")
            else:
                print(Fore.YELLOW + f"Simulated booking failed: {resp.get('message')}" + Style.RESET_ALL)

# ---------------------------
# CLI argument parsing
# ---------------------------
def build_parser():
    parser = argparse.ArgumentParser(prog=APP_NAME, description="BLS Algeria Booking Simulator & Safe Integration Template")
    sub = parser.add_subparsers(dest="command", required=True)

    gen = sub.add_parser("generate", help="Generate fake BLS records (simulation).")
    gen.add_argument("--count", "-c", type=int, default=200, help="How many records to generate.")
    gen.add_argument("--start-year", type=int, default=2025, help="Start year for expiries.")
    gen.set_defaults(func=handle_generate)

    check = sub.add_parser("simulate-check", help="Simulate checking generated records with multi-threading.")
    check.add_argument("--input", "-i", type=str, default=None, help="Input file to read records from (default: generated file).")
    check.add_argument("--threads", "-t", type=int, default=8, help="Number of worker threads.")
    check.set_defaults(func=handle_simulate_check)

    book = sub.add_parser("attempt-book", help="Attempt bookings (simulation).")
    book.add_argument("--input", "-i", type=str, default=None, help="Input file to read records from.")
    book.add_argument("--attempts", "-a", type=int, default=5, help="Number of random attempts to simulate.")
    book.add_argument("--use-real", action="store_true", help="Try to use real integration (only if REAL_INTEGRATION_ENABLED=True and real_book_request is implemented).")
    book.set_defaults(func=handle_attempt_book)

    return parser

# ---------------------------
# Main entry point
# ---------------------------
def main():
    banner()
    parser = build_parser()
    args = parser.parse_args()
    try:
        args.func(args)
    except Exception as exc:
        logging.exception("Unhandled exception: %s", exc)
        print(Fore.RED + "An error occurred. See log file for details." + Style.RESET_ALL)

if __name__ == "__main__":
    main()

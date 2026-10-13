"""Print a structural catalog for OGE second-part prototypes in the local PDF.

This does not publish source-bank questions or treat them as authored content.
Usage: python scripts/inspect-part-two-pdf.py path/to/source.pdf
"""
from collections import defaultdict
from pathlib import Path
import json
import re
import sys

from pypdf import PdfReader


def build_catalog(path: Path) -> list[dict]:
    reader = PdfReader(str(path))
    destinations = reader.named_destinations
    prototypes: dict[tuple[int, int], dict] = {}
    analogs = defaultdict(list)
    pattern = re.compile(r"^task::(2[0-5])\.(\d+)(?:\.(\d+))?$")
    for name, destination in destinations.items():
        match = pattern.fullmatch(name)
        if not match:
            continue
        number, prototype, analog = (int(value) if value else None for value in match.groups())
        key = (number, prototype)
        if analog is None:
            prototypes[key] = {
                "examNumber": number,
                "prototypeNumber": prototype,
                "prototypeId": f"{number}.{prototype}",
                "sourcePage": reader.get_destination_page_number(destination) + 1,
            }
        else:
            analogs[key].append(analog)
    catalog = []
    for key in sorted(prototypes):
        item = prototypes[key]
        choices = sorted(analogs[key])
        item["sourceAnalogIds"] = [f"{key[0]}.{key[1]}.{number}" for number in choices[:3]]
        item["availableSourceAnalogs"] = len(choices)
        catalog.append(item)
    return catalog


if __name__ == "__main__":
    source = Path(sys.argv[1])
    print(json.dumps(build_catalog(source), ensure_ascii=False, indent=2))

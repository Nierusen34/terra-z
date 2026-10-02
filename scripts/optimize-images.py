#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
from PIL import Image
import os

ROOT=Path(__file__).resolve().parents[1]
TARGETS=[ROOT/"images"/"city",ROOT/"images"/"districts"]
MIN_BYTES=1_000_000
MAX_RATIO=0.88
TEXT_EXTENSIONS={".html",".js",".css",".md",".json",".yml",".yaml"}

converted=[]

for folder in TARGETS:
    if not folder.exists():
        continue
    for source in sorted(folder.glob("*.png")):
        original_size=source.stat().st_size
        if original_size < MIN_BYTES:
            continue

        target=source.with_suffix(".webp")
        with Image.open(source) as image:
            image.load()
            mode="RGBA" if "A" in image.getbands() else "RGB"
            prepared=image.convert(mode)
            prepared.save(
                target,
                "WEBP",
                quality=90,
                method=6,
                exact=True
            )

        new_size=target.stat().st_size
        if new_size >= original_size*MAX_RATIO:
            target.unlink()
            print(f"SKIP {source.relative_to(ROOT)}: redução insuficiente")
            continue

        old_rel=source.relative_to(ROOT).as_posix()
        new_rel=target.relative_to(ROOT).as_posix()

        for path in ROOT.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
                continue
            if ".git" in path.parts:
                continue
            try:
                text=path.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                continue
            if old_rel in text:
                path.write_text(text.replace(old_rel,new_rel),encoding="utf-8")

        source.unlink()
        converted.append((old_rel,new_rel,original_size,new_size))
        print(f"OK {old_rel} -> {new_rel}: {original_size} -> {new_size}")

report=ROOT/"docs"/"IMAGE_OPTIMIZATION.md"
lines=[
    "# Terra Z — Otimização de Imagens",
    "",
    "Conversão automatizada e conservadora das imagens PNG mais pesadas de cidade/distritos.",
    "",
    "- Dimensões originais preservadas.",
    "- WebP quality 90 / method 6.",
    "- Arquivos só são substituídos quando a redução é de pelo menos 12%.",
    "- Referências no projeto são atualizadas automaticamente.",
    "",
]

if converted:
    total_before=sum(row[2] for row in converted)
    total_after=sum(row[3] for row in converted)
    reduction=100*(1-total_after/total_before)
    lines += [
        f"**Arquivos convertidos:** {len(converted)}",
        f"**Peso antes:** {total_before/1024/1024:.2f} MB",
        f"**Peso depois:** {total_after/1024/1024:.2f} MB",
        f"**Redução:** {reduction:.1f}%",
        "",
        "| Original | WebP | Antes | Depois | Redução |",
        "| --- | --- | ---: | ---: | ---: |",
    ]
    for old,new,before,after in converted:
        lines.append(
            f"| `{old}` | `{new}` | {before/1024/1024:.2f} MB | "
            f"{after/1024/1024:.2f} MB | {100*(1-after/before):.1f}% |"
        )
else:
    if report.exists():
        print("Nenhuma nova imagem exige conversão; relatório anterior preservado.")
        raise SystemExit(0)
    lines.append("Nenhuma imagem atingiu os critérios de conversão.")

report.write_text("\n".join(lines)+"\n",encoding="utf-8")
print(f"Relatório: {report.relative_to(ROOT)}")

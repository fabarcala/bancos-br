"""
fetch_curva_juros.py
====================
Busca a curva de juros prefixada (ETTJ PREF) da ANBIMA e
atualiza data/curva_juros.json com as 10 últimas curvas disponíveis.

Rodar diariamente via GitHub Actions.
"""

import json
import re
import sys
from datetime import datetime, date, timedelta
from pathlib import Path
import urllib.request

ANBIMA_URL  = "https://www.anbima.com.br/informacoes/est-termo/CZ-down.asp"
# Vértices que queremos exibir (os que têm ETTJ PREF consistentemente)
VERTICES_ALVO = [126, 252, 378, 504, 630, 756, 882, 1008, 1260, 1512, 1764, 2016, 2268, 2520]
OUTPUT_PATH = Path(__file__).parent.parent / "data" / "curva_juros.json"
MAX_CURVAS  = 10


def label_du(du: int) -> str:
    """Converte dias úteis em label legível (ex: 252 → '1a', 126 → '6m')."""
    mapping = {
        63:   "3m",
        126:  "6m",
        189:  "9m",
        252:  "1a",
        378:  "1,5a",
        504:  "2a",
        630:  "2,5a",
        756:  "3a",
        882:  "3,5a",
        1008: "4a",
        1134: "4,5a",
        1260: "5a",
        1512: "6a",
        1764: "7a",
        2016: "8a",
        2268: "9a",
        2520: "10a",
    }
    if du in mapping:
        return mapping[du]
    anos = du / 252
    return f"{anos:.0f}a" if anos == int(anos) else f"{anos:.1f}a"


def fetch_hoje() -> dict | None:
    """Busca a curva do dia atual da ANBIMA. Retorna dict {du: taxa} ou None."""
    try:
        req = urllib.request.Request(
            ANBIMA_URL,
            headers={"User-Agent": "Mozilla/5.0 (compatible; BancosBR/1.0)"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("latin-1")
    except Exception as e:
        print(f"Erro ao buscar ANBIMA: {e}", file=sys.stderr)
        return None

    # Extrai a data do arquivo
    data_match = re.search(r"(\d{2}/\d{2}/\d{4})", raw)
    if not data_match:
        print("Data não encontrada no arquivo ANBIMA", file=sys.stderr)
        return None
    data_str = data_match.group(1)  # DD/MM/YYYY

    # Parseia os vértices da seção ETTJ
    curva = {}
    in_ettj = False
    for line in raw.splitlines():
        line = line.strip()
        if "Vertices" in line and "ETTJ PREF" in line:
            in_ettj = True
            continue
        if not in_ettj:
            continue
        if not line or line.startswith("ETTJ"):
            continue

        parts = line.split(";")
        if len(parts) < 3:
            continue
        try:
            du  = int(parts[0].replace(".", ""))
            # ETTJ PREF é a 3ª coluna (índice 2)
            val = parts[2].replace(",", ".")
            if val:
                curva[du] = round(float(val), 4)
        except (ValueError, IndexError):
            continue

    if not curva:
        print("Nenhum dado ETTJ PREF encontrado", file=sys.stderr)
        return None

    # Filtra apenas os vértices alvo que existem
    curva_filtrada = {du: curva[du] for du in VERTICES_ALVO if du in curva}

    return {"data": data_str, "curva": curva_filtrada}


def main():
    # Carrega o JSON existente
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH) as f:
            historico = json.load(f)
    else:
        historico = {"curvas": [], "vertices": [], "labels": {}}

    # Busca dados de hoje
    nova = fetch_hoje()
    if not nova:
        print("Sem dados novos. Mantendo histórico atual.", file=sys.stderr)
        sys.exit(0)

    # Verifica se a data já existe
    datas_existentes = {c["data"] for c in historico.get("curvas", [])}
    if nova["data"] in datas_existentes:
        print(f"Data {nova['data']} já está no histórico. Nada a atualizar.")
        sys.exit(0)

    print(f"Nova curva adicionada: {nova['data']} — {len(nova['curva'])} vértices")

    # Adiciona e mantém apenas as últimas MAX_CURVAS
    historico["curvas"].append(nova)
    historico["curvas"] = historico["curvas"][-MAX_CURVAS:]

    # Atualiza metadados
    todos_vertices = sorted({du for c in historico["curvas"] for du in c["curva"]})
    historico["vertices"] = todos_vertices
    historico["labels"]   = {str(du): label_du(du) for du in todos_vertices}
    historico["updated"]  = datetime.now().strftime("%d/%m/%Y %H:%M")

    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(historico, f, ensure_ascii=False, indent=2)

    print(f"Salvo em {OUTPUT_PATH} — {len(historico['curvas'])} curvas no histórico.")


if __name__ == "__main__":
    main()

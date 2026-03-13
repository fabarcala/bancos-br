"""
fetch_curva_juros.py
====================
Busca a curva de juros prefixada (ETTJ PREF) da ANBIMA e
atualiza data/curva_juros.json com as 10 últimas curvas disponíveis.

Rodar diariamente via GitHub Actions.

Uso:
  python fetch_curva_juros.py              # busca curva de hoje
  python fetch_curva_juros.py 11/03/2026   # backfill de data específica
"""

import json
import re
import sys
from datetime import datetime, date
from pathlib import Path
import urllib.request

ANBIMA_URL    = "https://www.anbima.com.br/informacoes/est-termo/CZ-down.asp"
VERTICES_ALVO = [126, 252, 378, 504, 630, 756, 882, 1008, 1260, 1512, 1764, 2016, 2268, 2520]
OUTPUT_PATH   = Path(__file__).parent.parent / "data" / "curva_juros.json"
MAX_CURVAS    = 10


def label_du(du: int) -> str:
    mapping = {
        63:   "3m",  126:  "6m",  189:  "9m",  252:  "1a",
        378:  "1,5a", 504:  "2a",  630:  "2,5a", 756:  "3a",
        882:  "3,5a", 1008: "4a",  1134: "4,5a", 1260: "5a",
        1512: "6a",  1764: "7a",  2016: "8a",  2268: "9a",  2520: "10a",
    }
    if du in mapping:
        return mapping[du]
    anos = du / 252
    return f"{anos:.0f}a" if anos == int(anos) else f"{anos:.1f}a"


def fetch_curva(dt: date | None = None) -> dict | None:
    """Busca curva da ANBIMA. Se dt=None, busca o mais recente disponível.
    Usa parâmetro Dt_Ref=DD/MM/YYYY para datas passadas.
    Retorna {'data': 'DD/MM/YYYY', 'curva': {du: taxa}} ou None.
    """
    if dt:
        url = f"{ANBIMA_URL}?Dt_Ref={dt.strftime('%d/%m/%Y')}"
    else:
        url = ANBIMA_URL

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; BancosBR/1.0)"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("latin-1")
    except Exception as e:
        print(f"Erro ao buscar ANBIMA ({url}): {e}", file=sys.stderr)
        return None

    data_match = re.search(r"(\d{2}/\d{2}/\d{4})", raw)
    if not data_match:
        print("Data não encontrada no arquivo ANBIMA", file=sys.stderr)
        return None
    data_str = data_match.group(1)

    # Se pedimos uma data específica e a ANBIMA retornou outra, não tem dado nessa data
    if dt and data_str != dt.strftime("%d/%m/%Y"):
        print(f"ANBIMA retornou {data_str} em vez de {dt.strftime('%d/%m/%Y')} — sem dado para essa data", file=sys.stderr)
        return None

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
            val = parts[2].replace(",", ".")
            if val:
                curva[du] = round(float(val), 4)
        except (ValueError, IndexError):
            continue

    if not curva:
        print("Nenhum dado ETTJ PREF encontrado", file=sys.stderr)
        return None

    curva_filtrada = {du: curva[du] for du in VERTICES_ALVO if du in curva}
    return {"data": data_str, "curva": curva_filtrada}


def salvar(historico: dict) -> None:
    todos_vertices = sorted({int(du) if isinstance(du, str) else du
                             for c in historico["curvas"] for du in c["curva"]})
    historico["vertices"] = todos_vertices
    historico["labels"]   = {str(du): label_du(du) for du in todos_vertices}
    historico["updated"]  = datetime.now().strftime("%d/%m/%Y %H:%M")

    OUTPUT_PATH.parent.mkdir(exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(historico, f, ensure_ascii=False, indent=2)
    print(f"Salvo em {OUTPUT_PATH} — {len(historico['curvas'])} curvas no histórico.")


def main():
    # Aceita argumento de data para backfill (ex: python fetch_curva_juros.py 11/03/2026)
    dt_arg = None
    if len(sys.argv) > 1:
        try:
            dt_arg = datetime.strptime(sys.argv[1], "%d/%m/%Y").date()
            print(f"Modo backfill: buscando curva de {sys.argv[1]}")
        except ValueError:
            print(f"Data inválida: {sys.argv[1]} — use DD/MM/YYYY", file=sys.stderr)
            sys.exit(1)

    # Carrega histórico existente
    if OUTPUT_PATH.exists():
        with open(OUTPUT_PATH) as f:
            historico = json.load(f)
    else:
        historico = {"curvas": [], "vertices": [], "labels": {}}

    # Busca curva
    nova = fetch_curva(dt_arg)
    if not nova:
        print("Sem dados novos. Mantendo histórico atual.", file=sys.stderr)
        sys.exit(0)

    # Verifica duplicata
    datas_existentes = {c["data"] for c in historico.get("curvas", [])}
    if nova["data"] in datas_existentes:
        print(f"Data {nova['data']} já está no histórico. Nada a atualizar.")
        sys.exit(0)

    print(f"Nova curva: {nova['data']} — {len(nova['curva'])} vértices")

    # Insere em ordem cronológica e mantém MAX_CURVAS
    historico["curvas"].append(nova)
    historico["curvas"].sort(key=lambda c: datetime.strptime(c["data"], "%d/%m/%Y"))
    historico["curvas"] = historico["curvas"][-MAX_CURVAS:]

    salvar(historico)


if __name__ == "__main__":
    main()

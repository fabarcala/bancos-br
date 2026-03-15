"""
fetch_renda_plus.py
===================
Busca dados do Tesouro Renda+ Aposentadoria Extra 2064 via CSV do Tesouro Transparente
e atualiza data/renda_plus_2064.json com os últimos 252 pregões (~1 ano).

Rodar diariamente via GitHub Actions.
"""

import json
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

CSV_URL    = 'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'
VENCIMENTO = '15/12/2064'
TITULO     = 'Tesouro Renda+ Aposentadoria Extra 2064'
OUTPUT     = Path(__file__).parent.parent / 'data' / 'renda_plus_2064.json'
MAX_PREGOES = 252  # ~1 ano de pregões


def fetch_csv() -> str:
    req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'Mozilla/5.0 (compatible; BancosBR/1.0)'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode('latin-1')


def parse(raw: str) -> list[dict]:
    linhas = [l for l in raw.splitlines() if VENCIMENTO in l and 'Renda' in l]

    def parse_date(linha: str) -> datetime:
        return datetime.strptime(linha.split(';')[2], '%d/%m/%Y')

    linhas_sorted = sorted(linhas, key=parse_date)
    ultimos = linhas_sorted[-MAX_PREGOES:]

    dados = []
    for l in ultimos:
        partes = l.split(';')
        data   = partes[2]
        try:
            taxa = round(float(partes[4].replace(',', '.')), 2)   # taxa venda manhã
            pu   = round(float(partes[6].replace(',', '.')), 2)   # PU venda manhã
            dados.append({'data': data, 'taxa': taxa, 'pu': pu})
        except (ValueError, IndexError):
            continue

    return dados


def main():
    print('Buscando CSV do Tesouro Transparente...')
    try:
        raw = fetch_csv()
    except Exception as e:
        print(f'Erro ao buscar CSV: {e}', file=sys.stderr)
        sys.exit(1)

    dados = parse(raw)
    if not dados:
        print('Nenhum dado encontrado.', file=sys.stderr)
        sys.exit(1)

    output = {
        'titulo':     TITULO,
        'vencimento': VENCIMENTO,
        'dados':      dados,
        'updated':    datetime.now().strftime('%d/%m/%Y %H:%M'),
    }

    OUTPUT.parent.mkdir(exist_ok=True)
    with open(OUTPUT, 'w') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f'Salvo: {len(dados)} pregões | {dados[0]["data"]} → {dados[-1]["data"]}')
    print(f'Taxa atual (venda): {dados[-1]["taxa"]}% | PU: R$ {dados[-1]["pu"]}')


if __name__ == '__main__':
    main()

# Gera as 12 páginas de loteria a partir do index.html.
# Uso: powershell -File gerar-paginas.ps1
$utf8 = New-Object System.Text.UTF8Encoding($false)
$index = [System.IO.File]::ReadAllText((Join-Path $PSScriptRoot 'index.html'), $utf8)

$loterias = @(
  @{ slug = 'look-go';       nome = 'LOOK - GOIÁS' },
  @{ slug = 'boa-sorte-go';  nome = 'BOA SORTE - GOIÁS' },
  @{ slug = 'pt-rj';         nome = 'PT - RIO DE JANEIRO' },
  @{ slug = 'maluquinha-rj'; nome = 'MALUQUINHA - RIO DE JANEIRO' },
  @{ slug = 'bahia';         nome = 'BAHIA' },
  @{ slug = 'bahia-maluca';  nome = 'BAHIA MALUCA' },
  @{ slug = 'lbr';           nome = 'LBR' },
  @{ slug = 'saopaulo';      nome = 'SÃO PAULO' },
  @{ slug = 'lotep';         nome = 'LOTEP - PARAÍBA' },
  @{ slug = 'lotec';         nome = 'LOTECE - CEARÁ' },
  @{ slug = 'nacional';      nome = 'NACIONAL' },
  @{ slug = 'federal';       nome = 'FEDERAL' }
)

$descs = @{
  'look-go'       = 'Resultados do Jogo do Bicho LOOK - GOIÁS atualizados com todas as extrações do dia.'
  'boa-sorte-go'  = 'Resultados do Jogo do Bicho Boa Sorte - GOIÁS atualizados com todas as extrações do dia.'
  'pt-rj'         = 'Resultados do Jogo do Bicho PT - Rio de Janeiro atualizados com todas as extrações do dia.'
  'maluquinha-rj' = 'Resultados do Jogo do Bicho Maluquinha - Rio de Janeiro atualizados com todas as extrações do dia.'
  'bahia'         = 'Resultados do Jogo do Bicho Bahia atualizados com todas as extrações do dia.'
  'bahia-maluca'  = 'Resultados do Jogo do Bicho Bahia Maluca atualizados com todas as extrações do dia.'
  'lbr'           = 'Resultados do Jogo do Bicho LBR atualizados com todas as extrações do dia.'
  'saopaulo'      = 'Resultados do Jogo do Bicho São Paulo (PT-SP e Bandeirantes) atualizados.'
  'lotep'         = 'Resultados do Jogo do Bicho LOTEP - Paraíba atualizados com todas as extrações do dia.'
  'lotec'         = 'Resultados do Jogo do Bicho LOTECE - Ceará atualizados com todas as extrações do dia.'
  'nacional'      = 'Resultados da Loteria Nacional atualizados com todas as extrações do dia.'
  'federal'       = 'Resultados da Loteria Federal atualizados com todas as extrações do dia.'
}

foreach ($l in $loterias) {
  $slug = $l.slug
  $nome = $l.nome
  $desc = $descs[$slug]
  $url = "https://resultadosbicho.online/$slug.html"

  $html = $index
  $html = $html -replace '<body data-page-slug="index"', "<body data-page-slug=""$slug"""
  $html = $html -replace '<title>Resultados do Jogo do Bicho - ResultadosBicho</title>', "<title>$nome - Resultados do Jogo do Bicho</title>"
  $html = $html -replace '<meta name="description" content="[^"]*" />', "<meta name=""description"" content=""$desc"" />"
  $html = $html -replace '<link rel="canonical" href="[^"]*" />', "<link rel=""canonical"" href=""$url"" />"
  $html = $html -replace '<meta property="og:title" content="[^"]*" />', "<meta property=""og:title"" content=""$nome - Resultados do Jogo do Bicho"" />"
  $html = $html -replace '<meta property="og:url" content="[^"]*" />', "<meta property=""og:url"" content=""$url"" />"
  $html = $html -replace '<meta name="twitter:title" content="[^"]*" />', "<meta name=""twitter:title"" content=""$nome - Resultados do Jogo do Bicho"" />"
  $html = $html -replace '<meta name="twitter:description" content="[^"]*" />', "<meta name=""twitter:description"" content=""$desc"" />"
  $html = $html -replace '<option value="index" selected>', '<option value="index">'
  $html = $html -replace "<option value=""$slug"">", "<option value=""$slug"" selected>"

  $out = Join-Path $PSScriptRoot "$slug.html"
  [System.IO.File]::WriteAllText($out, $html, $utf8)
  Write-Host "Gerado: $slug.html"
}

Write-Host "Done."
# Cria o database D1 e aplica o schema.
# Uso (local dev):
#   wrangler d1 create RESULTADOSJB   -> imprime database_id (colar no wrangler.toml)
#   wrangler d1 execute RESULTADOSJB --local --file=worker/schema.sql
#   wrangler d1 execute RESULTADOSJB --remote --file=worker/schema.sql
# Se não houver wrangler, aplicar manualmente no dashboard (Console D1).
Write-Host "1) Crie o D1 no dashboard (Workers > D1 > Create): RESULTADOSJB" -ForegroundColor Cyan
Write-Host "2) Copie o database_id para worker/wrangler.toml" -ForegroundColor Cyan
Write-Host "3) Aplique o schema: npx wrangler d1 execute RESULTADOSJB --remote --file=worker/schema.sql" -ForegroundColor Cyan
Write-Host "4) Deploy: powershell -File deploy.ps1" -ForegroundColor Cyan
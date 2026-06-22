bash scripts/qa.sh
echo "---"
npm test --prefix backend
echo "---"
npm run build --prefix frontend
echo "✅ QA completo"

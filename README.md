# Dataset Explorer

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.23304466.svg)](https://doi.org/10.5281/zenodo.23304466)

Upload a CSV and instantly get column-level profiling — type detection, summary statistics, missing-value counts, and distribution charts.

**Live demo:** https://dataset-explorer.pplx.app

## Features

- CSV upload with automatic column type inference (numeric, categorical, date, boolean)
- Numeric stats: count, missing, min, max, mean, median, standard deviation, histogram
- Categorical stats: unique count and top values
- Saved datasets with a per-dataset detail dashboard
- Light and dark mode

## Tech stack

Express · React · Vite · Tailwind CSS · shadcn/ui · Recharts · Drizzle ORM · SQLite · TanStack Query · Zod

## Run locally

```bash
npm install
npm run dev      # http://localhost:5000
```

Production build:

```bash
npm run build
npm start
```

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/datasets` | List datasets |
| GET | `/api/datasets/:id` | Dataset with column stats and rows |
| POST | `/api/datasets` | Upload and profile a CSV |
| DELETE | `/api/datasets/:id` | Delete a dataset |

## Author

Samira Ray — [GitHub](https://github.com/Rei0322) · [LinkedIn](https://www.linkedin.com/in/samira-ray-44a58714a/) · [Kaggle](https://www.kaggle.com/samiraray)

## Citation

If you use this software, please cite it using the DOI [10.5281/zenodo.23304466](https://doi.org/10.5281/zenodo.23304466) (all versions) or [10.5281/zenodo.23304467](https://doi.org/10.5281/zenodo.23304467) (v1.0.0). Citation metadata is also in [CITATION.cff](CITATION.cff).

## License

MIT — see [LICENSE](LICENSE).

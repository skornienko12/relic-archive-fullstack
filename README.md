# RELIC ARCHIVE — Fullstack React + TypeScript + FastAPI

Учебный интернет-магазин архивной одежды и streetwear. Проект соответствует практической работе «КТ 6. Финальный проект» (50 баллов): настоящий Python FastAPI сервер, React + TypeScript клиент, SQLite, JWT, Zustand, React Router, Axios, CSS Modules.

## Структура

```text
relic-archive-fullstack/
├── frontend/                  # Vite, React, TypeScript
│   ├── src/api/client.ts      # Axios, baseURL, request/response interceptors
│   ├── src/auth.tsx           # AuthProvider, PrivateRoute
│   ├── src/store/cart.ts      # Типизированный Zustand
│   ├── src/pages/             # 7 страниц + 404
│   ├── src/components/        # Переиспользуемые компоненты
│   └── src/types.ts           # Pydantic-compatible interfaces, RequestState
└── backend/
    ├── main.py                # FastAPI, Pydantic, JWT, SQLite
    └── test_main.py           # API integration test
```

## Запуск на Windows (VS Code, два терминала)

Требуются **Node.js 20+** и **Python 3.10+**.

**Терминал 1 — FastAPI:**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Если PowerShell запрещает запуск `.ps1`, выполни без активации:

```powershell
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

**Терминал 2 — React:**

```powershell
cd frontend
npm install
npm run dev
```

Открыть в браузере **http://localhost:5173**. API: **http://127.0.0.1:8000/docs**. Сервер должен работать одновременно с фронтендом. Vite проксирует `/api` на порт 8000.

Демо-авторизация: **demo / archive123**. База `backend/relic.db` создаётся при запуске FastAPI. Данные товаров загружаются в SQLite, не являются мок-объектом в React.

## Сценарий проверки преподавателем

1. Главная `/`: загрузка featured-товаров с настоящего API.
2. Каталог `/products`: список товаров и фильтрация по категориям.
3. Товар `/products/1`: типизированный `useParams<'id'>`, `GET /api/products/1`, кнопка добавления в корзину.
4. Корзина `/cart`: Zustand, добавление/удаление, общая сумма.
5. Попробовать открыть напрямую **`/orders` без входа** → перенаправление на `/login`.
6. Войти `demo / archive123` → Axios сохраняет и передаёт JWT, `/orders` открыт, `GET /api/users/me`.
7. Создать демонстрационный заказ → `POST /api/orders`, запись в SQLite, обновление истории.
8. Нажать `LOG OUT` → удаление JWT, приватная страница снова закрыта.
9. Открыть `/not-a-page` → 404.
10. Остановить FastAPI и обновить каталог → видимое error-состояние. При работающем сервере видны loading/data.

## Маршруты API

| Method | Endpoint | JWT | Schema |
|---|---|---|---|
| GET | `/api/products` | нет | `Product[]` |
| GET | `/api/products/{product_id}` | нет | `Product` |
| POST | `/api/auth/login` | нет | `LoginInput` → `TokenResponse` |
| GET | `/api/users/me` | да | `User` |
| GET | `/api/orders` | да | `Order[]` |
| POST | `/api/orders` | да | `OrderCreate` → `Order` |
| GET | `/api/health` | нет | статус сервера |

Вход проходит с HTTP Bearer JWT. Request-interceptor добавляет токен, response-interceptor при HTTP 401 очищает его и уведомляет AuthProvider.

## Проверка проекта

```powershell
# В папке frontend
npm run build

# В папке backend, после установки requirements
python -m pytest -q
```

## Важные замечания

- Это **учебный демонстрационный проект**. Заказы без оплаты; почта и платёжная система не подключены.
- Перед публикацией сервера задай **надёжный `JWT_SECRET` через переменную окружения**. Значение по умолчанию допускается исключительно для локального запуска.
- Для продакшена нужно дополнительно настроить HTTPS, регистрацию, разграничение прав, защиту от злоупотреблений и постоянный секрет JWT.
- GitHub Pages может размещать **только статический фронтенд**, но не Python FastAPI. Для публичного Fullstack-демо нужен отдельный хостинг для backend и `VITE_API_URL` с его адресом.
- Исходный репозиторий Flask не изменён. Этот проект использует отдельный настоящий FastAPI, созданный для итоговой работы.

## Соответствие критериям

| Критерий | Где реализовано |
|---|---|
| Vite React + TypeScript | `frontend/package.json`, `frontend/vite.config.ts` |
| 4+ маршрута, динамический параметр, 404 | `frontend/src/main.tsx`, `pages/ProductDetail.tsx`, `pages/NotFound.tsx` |
| Защищённый прямой переход | `auth.tsx` + `/orders` |
| Axios + typed API + Pydantic | `api/client.ts`, `types.ts`, `backend/main.py` |
| loading/error/data | `types.ts`, `hooks.ts`, `RequestView.tsx`, формы и запросы заказов |
| Zustand не для авторизации | `store/cart.ts` |
| JWT, interceptors, logout | `auth.tsx`, `api/client.ts`, `pages/Login.tsx` |
| CSS Modules | Все компоненты и страницы (`*.module.css`), общий `reset.css` — только reset |
| TypeScript strict, без any | `frontend/tsconfig.json` |

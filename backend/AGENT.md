# AGENT.md — Fit App Backend

## Stack

- **Framework:** NestJS 11 (Express adapter)
- **Language:** TypeScript 5.7, target ES2023
- **Database:** PostgreSQL via Prisma 6.19
- **Auth:** JWT (passport-jwt) + bcrypt password hashing
- **Validation:** class-validator + class-transformer, global ValidationPipe
- **Testing:** Jest 30 + Supertest

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm run start:dev` |
| Build | `npm run build` |
| Production | `npm run start:prod` |
| Unit tests | `npm test` |
| E2E tests | `npm run test:e2e` |
| Lint | `npm run lint` |
| Format | `npm run format` |
| Prisma migrate | `npx prisma migrate dev` |
| Prisma generate | `npx prisma generate` |

Server listens on `PORT` env var (default 3000).

## Project Structure

```
src/
  main.ts                    # Bootstrap, global ValidationPipe
  app.module.ts              # Root module, imports all feature modules
  app.controller.ts          # GET / health check
  prisma/
    prisma.module.ts         # Global module exporting PrismaService
    prisma.service.ts        # Extends PrismaClient, auto-connect/disconnect
  auth/
    auth.module.ts           # JWT config (async from ConfigService)
    auth.controller.ts       # POST /auth/register, POST /auth/login
    auth.service.ts          # Register, login, JWT generation
    jwt.strategy.ts          # Passport JWT strategy (Bearer token)
    jwt-auth.guard.ts        # @UseGuards(JwtAuthGuard) decorator guard
    types/jwt-payload.type.ts
    dto/login.dto.ts
    dto/register.dto.ts
  goals/
    goals.controller.ts      # CRUD + progress tracking
    goals.service.ts         # Goal lifecycle, macro progress calculation
    dto/create-goal.dto.ts
    dto/update-goal.dto.ts
  foods/
    foods.controller.ts      # Create + search foods
    foods.service.ts
    dto/create-food.dto.ts
  food-logs/
    food-logs.controller.ts  # Daily food logging
    food-logs.service.ts     # Logs + daily totals aggregation
    dto/create-food-log.dto.ts
    utils/date-range.util.ts # parseDateRange(YYYY-MM-DD) -> UTC day bounds
  exercises/
    exercises.controller.ts  # CRUD exercises (list is public)
    exercises.service.ts
    dto/create-exercise.dto.ts
  workouts/
    workouts.controller.ts   # Full CRUD + summary
    workouts.service.ts      # Nested create with exercises/sets, calorie calc
    dto/create-workout.dto.ts
    dto/add-exercise-to-workout.dto.ts
    dto/add-workout-set.dto.ts
    dto/update-workout.dto.ts
  dashboard/
    dashboard.controller.ts  # GET /dashboard/daily
    dashboard.service.ts     # Aggregates nutrition + goal adherence
  progress/
    progress.controller.ts   # Record, summary, predictions, history
    progress.service.ts      # Linear regression for weight prediction
  chatbot/
    chatbot.controller.ts    # POST /chat, GET/DELETE /chat/history
    chatbot.service.ts       # Demo responses (no real LLM wired up yet)
    chatbot.dto.ts
  admin/
    admin.controller.ts      # User management + analytics
    admin.service.ts         # Ban/unban, promote/demote, analytics
    admin.guard.ts           # Role check: request.user.role === 'ADMIN'
prisma/
  schema.prisma              # 12 models, 2 enums
  prisma.config.ts           # Prisma config
  migrations/                # 4 applied migrations
```

## Database Models

12 models in `prisma/schema.prisma`:

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| User | email, password, role(USER/ADMIN), height, weight, macro targets, isActive | foodLogs, goals, workouts, chatMessages, progressMetrics |
| Food | name, calories, protein, carbs, fat, defaultServingUnit | logs, createdBy |
| FoodLog | userId, foodId, serving, servingUnit, mealType(BREAKFAST/LUNCH/DINNER/SNACK), date | user, food |
| Goal | userId, type(LOSE/MAINTAIN/GAIN_WEIGHT), target macros, startDate, endDate, isActive | user, logs |
| GoalLog | goalId, logDate, consumed macros, weightKg, note | goal, user |
| ExerciseCategory | name (unique) | exercises |
| Exercise | name, type(STRENGTH/CARDIO), targetMuscles[], categoryId | category, workoutLinks |
| Workout | userId, date, duration, notes, totalCaloriesBurned | user, exercises(WorkoutExercise[]) |
| WorkoutExercise | workoutId, exerciseId, sets, reps, weight, duration, distance, rpe, caloriesBurned | workout, exercise, workoutSets |
| WorkoutSet | workoutExerciseId, setNumber, reps, weight, duration, distance, rpe, completed | workoutExercise |
| ProgressMetric | userId, metricDate, weight, calorie/macro targets+consumed, adherence%, workoutsCompleted | user |
| ChatMessage | userId, role(user/assistant), content, metadata(JSON) | user |

Enums: `GoalType`, `ExerciseType`, `MealType`, `ServingUnit`, `UserRole`

## API Endpoints

All protected routes use `@UseGuards(JwtAuthGuard)`. Token via `Authorization: Bearer <token>`.

### Auth (public)
- `POST /auth/register` — email, password(6-100), optional: name, weight, height, calorieTarget
- `POST /auth/login` — email, password → { token, user }

### Goals (protected)
- `POST /goals` — create goal (deactivates existing)
- `GET /goals` — current active goal
- `PATCH /goals/:id` — update goal
- `GET /goals/progress?period=today|week` — macro adherence

### Foods (protected)
- `POST /foods` — create food entry
- `GET /foods?search=...` — search foods (limit 100)

### Food Logs (protected)
- `POST /food-logs` — log food consumption
- `GET /food-logs?date=YYYY-MM-DD` — daily logs with totals
- `GET /food-logs/totals?date=YYYY-MM-DD` — aggregated daily totals

### Exercises (mixed)
- `POST /exercises` — create exercise (protected)
- `GET /exercises?type=&category=&search=&muscleGroup=` — list (public)
- `GET /exercises/:id` — detail (public)

### Workouts (protected)
- `POST /workouts` — create with nested exercises + sets
- `GET /workouts?startDate=&endDate=&page=&limit=&type=&muscleGroup=` — paginated list
- `GET /workouts/summary?period=week|month` — stats summary
- `GET /workouts/:id` — detail
- `PATCH /workouts/:id` — update
- `DELETE /workouts/:id` — remove

### Dashboard (protected)
- `GET /dashboard/daily?date=YYYY-MM-DD` — nutrition + goal adherence

### Progress (protected)
- `POST /progress/record` — snapshot daily metrics
- `GET /progress/summary?days=30` — weight trend, avg adherence
- `GET /progress/predictions` — linear regression to goal weight
- `GET /progress/weight-history?days=30` — weight chart data
- `GET /progress/calorie-history?days=30` — calorie chart data

### Chatbot (protected)
- `POST /chat` — send message (demo responses, no real LLM)
- `GET /chat/history?limit=50` — conversation history
- `DELETE /chat/history` — clear history

### Admin (protected + AdminGuard)
- `GET /admin/users?page=&limit=&role=` — paginated user list
- `GET /admin/analytics` — platform stats
- `PATCH /admin/users/:id/ban` — deactivate user
- `PATCH /admin/users/:id/unban` — reactivate user
- `DELETE /admin/users/:id` — delete user (not admins)
- `PATCH /admin/users/:id/promote` — make admin
- `PATCH /admin/users/:id/demote` — remove admin

## Auth Flow

1. Register/login returns JWT with payload `{ sub: uuid, email, role }`
2. JWT secret from `JWT_SECRET` env var (default: 'dev-secret')
3. Token expiry from `JWT_EXPIRES_IN_SECONDS` (default: 604800 = 7 days)
4. Guards: `JwtAuthGuard` validates token, `AdminGuard` checks `role === 'ADMIN'`
5. Authenticated user available as `request.user` in controllers

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| DATABASE_URL | yes | — | PostgreSQL connection string |
| JWT_SECRET | yes | 'dev-secret' | JWT signing secret |
| JWT_EXPIRES_IN_SECONDS | no | 604800 | Token TTL |
| PORT | no | 3000 | Server port |
| LLM_PROVIDER | no | openai | Chatbot provider (groq/openai/gemini) |
| LLM_API_KEY | no | — | LLM API key |
| ML_SERVICE_URL | no | — | ML service endpoint |

## Conventions

- NestJS module pattern: each feature = module + controller + service + DTOs
- Constructor-based dependency injection throughout
- DTOs use class-validator decorators for input validation
- Global `ValidationPipe` with `whitelist: true, transform: true, forbidNonWhitelisted: true`
- NestJS exceptions for error responses (BadRequestException, NotFoundException, ForbiddenException)
- Prisma for all DB access, no raw SQL
- Single quotes, trailing commas (Prettier config)
- Tests: `.spec.ts` for unit, `.e2e-spec.ts` for integration

## Swagger / OpenAPI

- Interactive docs at `http://localhost:3000/api`
- JSON spec at `http://localhost:3000/api-json`
- CLI plugin in `nest-cli.json` auto-generates `@ApiProperty` from class-validator decorators
- Controllers use `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`, `@ApiQuery`
- Use "Authorize" button in Swagger UI with Bearer token from `/auth/login`

## Known Gaps

- Chatbot uses demo responses — no real LLM integration wired up
- No rate limiting
- No refresh token mechanism
- `JWT_SECRET` defaults to 'dev-secret' in dev
- No CORS configuration in bootstrap

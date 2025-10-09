<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

## Development (Docker) — dev with hot-reload (PowerShell)

This project includes a development workflow that runs the app inside Docker with hot-reload (Nest watch). The repo contains a `docker-compose.override.yml` which switches the app to `yarn start:dev` and mounts the project files into the container.

Prerequisites

- Docker Desktop running
- PowerShell (Windows)

Quick start (PowerShell)

1. Copy the example env file and edit the password:

```powershell
Copy-Item .env.example .env
# then open .env and replace <votre_mot_de_passe_solide_ici> with a real password
code .env
```

2. Start the development stack (rebuild if needed):

```powershell
docker-compose up --build
# or run in background
docker-compose up --build -d
```

3. Follow the app logs:

```powershell
docker-compose logs -f app
```

4. Open the app in your browser:

```
http://localhost:3000/properties
```

5. Stop the stack:

```powershell
docker-compose down
```

Notes about hot-reload and mounts

- The override mounts the project into `/usr/src/app` and runs `yarn start:dev` inside the container. Code edits in VS Code will be picked up by Nest's watch mode.
- If you add or change dependencies (package.json), rebuild the image or install the dependency inside the running container:

```powershell
docker-compose exec app yarn add <package>
docker-compose restart app
```

What `scripts/wait-for-db.sh` does

- Waits for Postgres to be ready using `pg_isready` (this checks SQL readiness, not just TCP port).
- Retries a number of times (configured inside the script) and exits if DB never becomes ready.
- When ready it runs `npx prisma migrate deploy` to apply migrations and then execs the main command (start the app).

This prevents the app from starting too early and failing with Prisma/DB connection errors.

Rebuild the image (when Dockerfile or system packages change)

```powershell
docker-compose build app
docker-compose up -d
```

Troubleshooting

- `Cannot find module 'hbs'` inside the container:
  ```powershell
  docker-compose exec app yarn add hbs
  docker-compose restart app
  ```
- Prisma can't reach DB: check `docker-compose logs db` and `docker-compose logs app`.
- Bind mount performance on Windows: if you notice slowness, consider using WSL2 (open the project from WSL) for better file system performance.

Useful commands

- Build & start in background: `docker-compose up --build -d`
- Follow logs: `docker-compose logs -f app`
- Run Prisma migrate: `docker-compose exec app npx prisma migrate deploy`
- Run a shell inside the app container: `docker-compose exec app sh`

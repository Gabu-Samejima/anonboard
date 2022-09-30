# Anonboard

Anonboard, also known as "Pinboard" is a really simple Twitter-like clone
where you are able to anonymously post text content. It was built as a little
project during my vacation just because I was bored!

## Is it production ready?

No. Probably not? I guess? I don't know. You do what you want.

## Usage

Here's an easier, and recommended way to host your site on Vercel:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FGreek%2Fanonboard&env=NEXTAUTH_URL,NEXTAUTH_SECRET,DATABASE_URL,REDIS_URL,REDIS_TOKEN&envDescription=The%20variables%20needed%20to%20allow%20the%20app%20to%20function%20properly&project-name=anonboard&repo-name=anonboard)

To use Anonboard, here's what you need:
* A PostgreSQL database
* Upstash Redis instance (for ratelimiting)

You can use the [Docker Compose](#docker-usage) to host the database, although I'm not sure if a regular
Redis instance will work for ratelimiting api routes, because it's Upstash specific.

Here's the steps!

** If you're using Docker, skip step 4 **

1. Clone the repository
```sh
$ git clone https://github.com/Greek/anonboard.git
```

2. Copy the `.env.example` file to `.env` and fill in the gaps yourself

##### ** BE SURE TO READ THE COMMENTS IN THE FILE!!! **

```sh
$ cp .env.example .env
$ nano .env
```

3. Push the schemas to the database server
```sh
$ npx prisma db push
```

4. Install dependencies, then run (the developer server)!

```sh 
$ yarn

# ...

$ yarn dev
```

### Docker Usage

Install [Docker](https://docs.docker.com/get-docker/) and make sure it's properly set up!
Then, open up a terminal and run these command:



1. Go to the Docker directory
```sh
$ cd docker
```

2. Start up the dependencies!
```sh
$ docker-compose up -d
```

3. Change your environment variables accordingly
```sh
DATABASE_URL=postgres://postgres:password@localhost:5432/anonboard
```

4. Install dependencies and run server.

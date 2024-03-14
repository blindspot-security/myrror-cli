# Myrror CLI

Myrror CLI is a command-line tool that uses the Myrror API to check the status of your projects.

## Installation

To install this project, you need to clone the repository and install all necessary dependencies:

```bash
git clone https://github.com/user/myrror-cli.git
cd myrror-cli
npm install
```

## Configuration

To configure the project, you need to set the following environment variables:

```bash
MYRROR_CLIENT_ID='your-client-id'
MYRROR_SECRET='your-secret'
MYRROR_API='https://api.blindspot-security.com/v1'
MYRROR_REPOSITORY= # optional your repository name
MYRROR_BRANCH= # optional your branch name
MYRROR_COMMIT= # optional your commit hash
MYRROR_RETRY_TIME=10000 # 10 sec in milliseconds
MYRROR_TIMEOUT=3600000 # an hour in milliseconds
```

You can set these variables in a `.env` file at the root of the project.

## Usage

Before using the CLI, you first need to build the project:

```bash
npm run build
```

After building, you can run the CLI as follows:

```bash
npm run status -- -r your-repository -b your-branch -c your-commit
```

### Help Command

You can use the `--help` command to get information about how to use the CLI:

```bash
npm run status -- --help
```

This will display information about the available options and how to use them:

```
Usage: npm run status -- [options]

Options:
  -r, --repository [string]  Specify the repository
  -b, --branch [string]      Specify the branch
  -c, --commit [string]      Specify the commit

Examples:
  npm run status -- -r your-repository -b your-branch -c your-commit
```

### Example

Here is an example of how the CLI works:

```bash
npm run status -- -r your-repository -b your-branch -c your-commit

> myrror-cli@0.0.1 status
> node dist/main status -r your-repository -b your-branch -c your-commit

[Nest] 56826  - 03/05/2024, 3:55:16 PM     LOG status is pending
[Nest] 56826  - 03/05/2024, 3:55:16 PM     LOG retrying...
[Nest] 56826  - 03/05/2024, 3:55:26 PM     LOG status is scanned
┌──────────────────────────────────────────────────────────────────────────────┐
│                                  PR Issues                                   │
├───┬────────────────────────┬──────────┬─────────────────┬────────────────────┤
│ № │ Name                   │ Severity │ Dependency name │ Dependency version │
├───┼────────────────────────┼──────────┼─────────────────┼────────────────────┤
│ 1 │ CVE-2023-43646:CWE-400 │ high     │ get-func-name   │ 2.0.0              │
└───┴────────────────────────┴──────────┴─────────────────┴────────────────────┘
```

## Support

If you encounter any issues with using this CLI, please create an issue in this repository.

## License

This project is available under the MIT license. For more details, see the [LICENSE](LICENSE)

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

## GitLab Integration

### Pipeline Configuration

The GitLab CI/CD pipeline is controlled by a file named `.gitlab-ci.yml` located in the root directory of the project.

#### .gitlab-ci.yml

Myrror provides a template that you can use that already has jobs defined for the pipeline. All you need to do is add this one line that includes the template file.

```yaml
include: 'https://raw.githubusercontent.com/blindspot-security/myrror-cli/main/templates/gitlab/myrror-cli.gitlab-ci.yml'
```

If you need to override any parameters or variables of the scan, all you need to do is define the variables in the .gitlab-ci.yml file. For example, your .gitlab-ci.yml file would look like this:

```yaml
include: 'https://raw.githubusercontent.com/blindspot-security/myrror-cli/main/templates/gitlab/myrror-cli.gitlab-ci.yml'

variables:
  MYRROR_CLIENT_ID: 'your-client-id'
  MYRROR_SECRET: 'your-secret'
```

Replace 'your-client-id' and 'your-secret' with the actual values. It is recommended to use secret values for these variables.

## Bitbucket Integration

### Pipeline Configuration

The Bitbucket CI/CD pipeline is controlled by a file named `bitbucket-pipelines.yml` located in the root directory of the project.

#### bitbucket-pipelines.yml

Myrror provides a template that you can use that already has jobs defined for the pipeline. All you need to do is copy the file from `templates/bitbucket` and rename it from to `bitbucket-pipelines.yml` in your repository.

Here is an example configuration you can use:

```yaml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Myrror Scan on PR to YOUR_MAIN_BRANCH
          image: myrrorsecurity/myrror-cli:latest
          caches:
            - node
          script:
            - |
              if [ "$BITBUCKET_PR_DESTINATION_BRANCH" == "YOUR_MAIN_BRANCH" ]; then
                echo "Running Myrror scan for PR to YOUR_MAIN_BRANCH"
                export MYRROR_REPOSITORY=$BITBUCKET_REPO_SLUG
                export MYRROR_BRANCH=$BITBUCKET_BRANCH
                export MYRROR_COMMIT=$BITBUCKET_COMMIT
                export MYRROR_CLIENT_ID=$MYRROR_CLIENT_ID
                export MYRROR_SECRET=$MYRROR_SECRET
                export MYRROR_API="https://api.ls.blindspot-security.com/v1"
                node /usr/src/app/dist/main status -r $MYRROR_REPOSITORY -b $MYRROR_BRANCH -c $MYRROR_COMMIT
              else
                echo "Not running Myrror scan, as this is not a PR to YOUR_MAIN_BRANCH"
              fi
```

Replace `YOUR_MAIN_BRANCH` with the name of your main branch (e.g., `main` or `master`). Also, replace `'your-client-id'` and `'your-secret'` with your actual Myrror client ID and secret. It is recommended to use secret values for these variables.

Make sure to set the following environment variables in your Bitbucket repository settings:

- `MYRROR_CLIENT_ID`
- `MYRROR_SECRET`

This setup will ensure that Myrror scans are only executed if there are open pull requests from the current branch to your main branch.

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

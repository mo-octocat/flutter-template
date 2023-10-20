module.exports = async ({ github, context, core }) => {
    const util  = require("node:util");
    const { exec }  = require("node:child_process");

    const issueForm = JSON.parse(process.env.ISSUE_FORM_JSON)
    const description = issueForm["repository-description"].text
    const justification = issueForm["repository-justification"].text
    const email = "mouismail@github.com"
    const templateRepoName = "aws-stack-fluttertech-landing-zone-config"
    const owner = "mo-octocat"
    const organizationalUnit = "mo-octocat"
    const path = "accounts-config.yaml"
    const branch = "main"
    const name = issueForm["repository-name"].text


    const file = await github.rest.repos.getContent({
        owner,
        repo: templateRepoName,
        path,
        ref: branch
    });

    await installDependency({ dependency: "js-yaml" });
    const yaml = require('js-yaml');

    const content = Buffer.from(file.data.content, 'base64').toString();
    const config = yaml.load(content);
    const newData = [{
        name: name,
        description: description,
        email: email,
        organizationalUnit: owner,
    }];
    const newConfig = {
        ...config { newData }};

    const newContent = yaml.dump(newConfig);

    await github.rest.repos.createOrUpdateFileContents({
        owner,
        repo: templateRepoName,
        path,
        message: `Update ${templateRepoName} in config.yaml`,
        content: Buffer.from(newContent).toString('base64'),
        sha: file.data.sha,
        branch
    });

    async function installDependency({ dependency }) {
      installDependency.cache ??= new Set();

      if (installDependency.cache.has(dependency)) {
        return;
      }

      installDependency.cache.add(dependency);

      try {
        await util.promisify(exec)(`npm install ${dependency}`);
      } catch (error) {
        console.error(
          `Dynamic install of required ${dependency} dependency failed.`
        );
        throw error;
      }
    }

    core.setOutput('config', newContent);
}

module.exports = async ({ github, context, core }) => {
    const issueForm = JSON.parse(process.env.ISSUE_FORM_JSON)
    const description = issueForm["repository-description"].text
    const justification = issueForm["repository-justification"].text
    const email = "mouismail@github.com"
    const name = "aws-stack-fluttertech-landing-zone-config"
    const owner = "mo-octocat"
    const organizationalUnit = "mo-octocat"
    const path = "accounts-config.yaml"
    const branch = "main"

    const errors = []
  
    const file = await github.rest.repos.getContent({
        owner,
        repo: name,
        path,
        ref: branch
    });
   
    const content = Buffer.from(file.data.content, 'base64').toString();
    const config = yaml.load(content);

    const newConfig = {
        ...config,
        [name]: {
            description,
            email,
            organizationalUnit
        }
    };
    const newContent = yaml.dump(newConfig);

    await github.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Update ${name} in config.yaml`,
        content: Buffer.from(newContent).toString('base64'),
        sha: file.data.sha,
        branch
    });


    core.setOutput('config', newContent);

    // // add comment to the issue with the updated config

    // const comment = `Thanks for your contribution, the config file has been updated with the following content: \n\n\`\`\`json\n${newContent}\n\`\`\``;
    // await github.issues.createComment({
    //     owner,
    //     repo,
    //     issue_number: context.issue.number,
    //     body: comment
    // });
}

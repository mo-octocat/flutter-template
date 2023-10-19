module.exports = async ({ github, context, core }) => {
    const issueForm = JSON.parse(process.env.ISSUE_FORM_JSON)
    const access = issueForm["repository-access"].text
    const description = issueForm["repository-description"].text
    const justification = issueForm["repository-justification"].text
    const name = issueForm["repository-name"].text
    const owner = issueForm["repository-owner"].text
    const visibility = issueForm["repository-visibility"].text.toLowerCase()
    const path = 'accounts-config.yaml';
    const branch = 'main';


    const errors = []

    // Ensure organization does exist
    try {
        const response = await github.rest.orgs.get({
            org: owner,
        })
    } catch (error) {
        errors.push(`Please update **Repository owner** as ${owner} does not exist`)
    }

    // Ensure repository does not exist
    try {
        const response = await github.rest.repos.get({
            owner: owner,
            repo: name,
        })

        errors.push(`Please update **Repository name** as ${owner}/${name} already exists`)
    } catch (error) {
        if (error.status !== 404) {
            errors.push(`Issue arose checking if ${owner}/${name} already exists; please review workflow logs`)
        }
    }

    const file = await github.repos.getContent({
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

    await github.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message: `Update ${name} in config.yaml`,
        content: Buffer.from(newContent).toString('base64'),
        sha: file.data.sha,
        branch
    });


    core.setOutput('config', newContent);

    // add comment to the issue with the updated config

    const comment = `Thanks for your contribution, the config file has been updated with the following content: \n\n\`\`\`json\n${newContent}\n\`\`\``;
    await github.issues.createComment({
        owner,
        repo,
        issue_number: context.issue.number,
        body: comment
    });
}

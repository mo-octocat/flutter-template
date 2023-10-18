const octokit = new Octokit({
  auth: 'YOUR-TOKEN'
})

await octokit.request('POST /repos/{template_owner}/{template_repo}/generate', {
  template_owner: 'TEMPLATE_OWNER',
  template_repo: 'TEMPLATE_REPO',
  owner: 'octocat',
  name: 'Hello-World',
  description: 'This is your first repository',
  include_all_branches: false,
  'private': false,
  headers: {
    'X-GitHub-Api-Version': '2022-11-28'
  }
})

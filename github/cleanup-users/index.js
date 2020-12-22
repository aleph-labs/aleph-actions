const core = require('@actions/core')
const github = require('@actions/github')
const graphql = require('graphql.js')

try {
    const organizationName = core.getInput('organization-name')
    const organizationId = core.getInput('organization-id')
    const excludedTeamSlug = core.getInput('ignore-team-slug')

    const token = core.getInput('token')

    const today = new Date()
    const endOfLastMonthDateISOString = (new Date(today.getFullYear(), today.getMonth(), 1)).toISOString()

    console.log(`Checking inactive users for...`)
    console.log(`> Organization: ${organizationName}`)
    console.log(`> Organization ID: ${organizationId}`)
    console.log(`> Since: ${endOfLastMonthDateISOString}`)
    console.log('Warning: This action only checks the first 100 users.')

    var graph = graphql("https://api.github.com/graphql", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "user-agent": "node.js"
        },
        asJSON: true
    })

    graph(`{
        organization(login: "${organizationName}"){
            team(slug: "${excludedTeamSlug}") {
                members {
                    edges {
                        node {
                            login
                        }
                    }
                }
            }
            membersWithRole(first: 100) {
                edges {
                    node {
                        login
                        contributionsCollection(organizationID: "${organizationId}", from: "${endOfLastMonthDateISOString}") {
                            hasAnyContributions
                        }
                    }
                }
            }
        }
      }`)({
    }).then(function (response) {
        var inactiveUsers = response.organization.membersWithRole.edges
            .filter(it => !it.node.contributionsCollection.hasAnyContributions)
            .map(it => it.node.login)
            
        var ignoredUsers = response.organization.team.members.edges
            .map(it => it.node.login)
        let filteredInactiveUsers = inactiveUsers.filter(it => !excludedUsers.includes(it))
        
        core.setOutput("inactive-users", filteredInactiveUsers)
        core.setOutput("ignored-users", ignoredUsers)
    }).catch(function (error) {
        core.setFailed(error)
    })

    // // Get the JSON webhook payload for the event that triggered the workflow
    // // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // // console.log(`The event payload: ${payload}`)
} catch (error) {
    core.setFailed(error.message)
}
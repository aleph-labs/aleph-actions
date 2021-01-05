const core = require('@actions/core')
const graphql = require('graphql.js')
const fetch = require("node-fetch")

try {
    // For GitHub
    const organizationName = core.getInput('organization-name')
    const organizationId = core.getInput('organization-id')
    const token = core.getInput('token')
    // For Google Chat
    const googleChatWebhookUrl = core.getInput('google-chat-webhook-url')

    const today = new Date()
    const endOfLastMonthDateISOString = (new Date(today.getFullYear(), today.getMonth(), 1)).toISOString()

    core.info(`Checking billing summary for...`)
    core.info(`> Organization: ${organizationName}`)
    core.info(`> Organization ID: ${organizationId}`)

    getInactiveUsers(token, organizationName, organizationId, endOfLastMonthDateISOString)
        .then(inactiveUsers => reportToGoogleChat(inactiveUsers, googleChatWebhookUrl))
        .then(_ => core.info("Successfully posted message to Google Chat."))
        .catch(error => core.setFailed(error))

} catch (error) {
    core.setFailed(error.message)
}

function getInactiveUsers(token, organizationName, organizationId, endOfLastMonthDateISOString) {
    let graph = graphql("https://api.github.com/graphql", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "user-agent": "node.js"
        },
        asJSON: true
    })

    return new Promise((resolve, reject) => {
        graph(`{
            organization(login: "${organizationName}"){
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
            resolve(inactiveUsers)
        }).catch(function (error) {
            reject(error)
        })
    })
}
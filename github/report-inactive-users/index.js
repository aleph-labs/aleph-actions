const core = require('@actions/core');
const graphql = require('graphql.js');
const fetch = require('node-fetch');

try {
  // For GitHub
  const organizationName = core.getInput('organization-name');
  const organizationId = core.getInput('organization-id');
  const token = core.getInput('token');
  // For Google Chat
  const googleChatWebhookUrl = core.getInput('google-chat-webhook-url');

  const today = new Date();
  const thirtyDaysBeforeToday = new Date(today);
  thirtyDaysBeforeToday.setDate(today.getDate() - 30);
  const thirtyDaysBeforeTodayISOString = thirtyDaysBeforeToday.toISOString();

  core.info(`Checking inactive users for...`);
  core.info(`> Organization: ${organizationName}`);
  core.info(`> Organization ID: ${organizationId}`);
  core.info(`> Since: ${thirtyDaysBeforeTodayISOString}`);
  core.info('Warning: This action only checks the first 100 users.');

  getInactiveUsers(
    token,
    organizationName,
    organizationId,
    thirtyDaysBeforeTodayISOString
  )
    .then((inactiveUsers) =>
      reportToGoogleChat(inactiveUsers, googleChatWebhookUrl)
    )
    .then((_) => core.info('Successfully posted message to Google Chat.'))
    .catch((error) => core.setFailed(error));
} catch (error) {
  core.setFailed(error.message);
}

function getInactiveUsers(
  token,
  organizationName,
  organizationId,
  thirtyDaysBeforeTodayISOString
) {
  let graph = graphql('https://api.github.com/graphql', {
    headers: {
      Authorization: `Bearer ${token}`,
      'user-agent': 'node.js',
    },
    asJSON: true,
  });

  return new Promise((resolve, reject) => {
    graph(`{
            organization(login: "${organizationName}"){
                membersWithRole(first: 100) {
                    edges {
                        node {
                            login
                            contributionsCollection(organizationID: "${organizationId}", from: "${thirtyDaysBeforeTodayISOString}") {
                                hasAnyContributions
                            }
                        }
                    }
                }
            }
          }`)({})
      .then(function (response) {
        var inactiveUsers = response.organization.membersWithRole.edges
          .filter((it) => !it.node.contributionsCollection.hasAnyContributions)
          .map((it) => it.node.login);
        resolve(inactiveUsers);
      })
      .catch(function (error) {
        reject(error);
      });
  });
}

function reportToGoogleChat(inactiveUsers, googleChatWebhookUrl) {
  var data;
  if (inactiveUsers === undefined || inactiveUsers.length == 0) {
    data = `{
            "cards": [
              {
                "header": {
                  "title": "Time to cleanup GitHub users!",
                  "subtitle": "7 days to go for the next billing cycle to start!"
                },
                "sections": [
                  {
                    "widgets": [
                      {
                        "keyValue": {
                          "topLabel": "Inactive Users (Last 30 Days)",
                          "content": "No inactive users 👍!",
                          "contentMultiline": "true"
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }`;
  } else {
    data = `{
            "cards": [
              {
                "header": {
                  "title": "Time to cleanup GitHub users!",
                  "subtitle": "7 days to go for the next billing cycle to start!"
                },
                "sections": [
                  {
                    "widgets": [
                      {
                        "keyValue": {
                          "topLabel": "Inactive Users (Last 30 Days)",
                          "content": "${inactiveUsers.join('\n')}",
                          "contentMultiline": "true"
                        }
                      }
                    ]
                  },
                  {
                    "widgets": [
                      {
                        "buttons": [
                          {
                            "textButton": {
                              "text": "MANAGE MEMBERS",
                              "onClick": {
                                "openLink": {
                                  "url": "https://github.com/orgs/aleph-labs/people"
                                }
                              }
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }`;
  }

  return new Promise((resolve, reject) => {
    fetch(googleChatWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

pipeline {
  agent {
    label 'crew-apollo' // Run only on agents under this label
  }

  tools {
    // Make sure Jenkins supports the version below. If not, contact #crew-bronn
    nodejs '6.14.3'
  }

  options {
    timeout(time: 10, unit: 'MINUTES') // Global timeout for the job
    disableConcurrentBuilds()
  }

  parameters {
    string(name: 'SlackTarget', defaultValue: '#crew-apollo-alerts', description: 'Target Slack Channel for notifications')
  }

  stages {
    stage('SharedLibs') {
      steps {
        library identifier: 'auth0-jenkins-pipelines-library@master', retriever: modernSCM(
          [$class: 'GitSCMSource',
           remote: 'git@github.com:auth0/auth0-jenkins-pipelines-library.git',
           credentialsId: 'auth0extensions-ssh-key'])
      }
    }

    stage('Build') {
      steps {
        sshagent(['auth0extensions-ssh-key']) {
          sh 'npm install'
        }
      }
    }

    stage('Test') {
      environment {
        V1_TENANTID = credentials('WAAD_TENANTID')
        V1_APPPRINCIPALID = credentials('WAAD_APPPRINCIPALID')
        V1_SYMMETRICKEY = credentials('WAAD_SYMMETRICKEY')
        V1_UPN = credentials('WAAD_V1_UPN')

        V2_WAAD_TENANTDOMAIN = credentials('WAAD_V2_TENANTDOMAIN')
        V2_WAAD_CLIENTID = credentials('WAAD_V2_CLIENTID')
        V2_WAAD_CLIENTSECRET = credentials('WAAD_V2_CLIENTSECRET')
        V2_UPN = credentials('WAAD_V2_UPN')

        USER_OBJECT_ID = credentials('WAAD_USER_OBJECT_ID')
        USER_DISPLAY_NAME = credentials('WAAD_USER_DISPLAY_NAME')
        USER_GROUPS = credentials('WAAD_USER_GROUPS')
        INVALID_EMAIL = credentials('WAAD_INVALID_EMAIL')
      }
      steps {
        script {
          try {
            sh 'npm test'
            githubNotify context: 'jenkinsfile/auth0/tests', description: 'Tests passed', status: 'SUCCESS'
          } catch (error) {
            githubNotify context: 'jenkinsfile/auth0/tests', description: 'Tests failed', status: 'FAILURE'
            throw error
          }
        }
      }
    }

    stage('Report to SonarQube') {
      steps {
        sendToSonarQube env
      }
    }
  }

  post {
    always {
      script {
        String additionalMessage = '';
        if (env.BRANCH_NAME.startsWith("PR-")) {
          additionalMessage += "\nPR: ${env.CHANGE_URL}\nTitle: ${env.CHANGE_TITLE}\nAuthor: ${env.CHANGE_AUTHOR}";
        }

        notifySlack(slackTarget, additionalMessage);
      }
      deleteDir()
    }
  }
}

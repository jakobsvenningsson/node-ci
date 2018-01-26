var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var rimraf = require('rimraf');
var request = require('request');

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello world')
})

app.post('/', function (req, res) {
    const repo = req.body["repository"];
    const commit = req.body["head_commit"];
    const branch = req.body["ref"].split('/').slice(-1)[0]
    const gitURL = repo["clone_url"];
    const repoName = repo["name"];
    const sha = commit["id"];
    const statusURL = repo["statuses_url"];

    cloneRepo(gitURL, repoName, branch)
      .then(() => {
        return buildRepo(repoName)
      })
      .then(() => {
        updateGithubStatus(0, repoName, sha)
      })
      .catch((code) => {
        if(code == 2) {
          console.log("build failed")
          console.log("Sent error status to github")
          updateGithubStatus(1, repoName, sha)
        }
      })
    res.send('hello world')
})

const cloneRepo = (gitURL, repoName, branch) => {
    console.log(`Cloning: ${branch}`)
    return new Promise((resolve, reject) => {
      rimraf.sync(`/tmp/${repoName}`);
      runChildProcess('git', ['clone', '-b', branch, gitURL])
        .then(() => {
          resolve()
        })
        .catch(() => {
          reject(1)
        })
    })
}

const buildRepo = () => {
  return new Promise((resolve, reject) => {
    runChildProcess('npm', ['test'])
      .then(() => {
        resolve()
      })
      .catch(() => {
        reject(2)
      })
  })
}

const runChildProcess = (script, args) => {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    const process = spawn(script, args, { cwd: '/tmp/' });

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });  

    process.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });

    process.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      if(!code) {
        resolve();
      } else {
        reject();
      }
    });
  })
} 

const updateGithubStatus = (state, repoName, sha) => {
  const body = {
    'target_url': 'https://example.com',
    'context': 'simple-ci-node',
    'state': !state ? 'error' : 'success',
    'description': !state ? 'the build failed ' : 'the build successeded'
  }
  const url = `https://api.github.com/repos/jakobsvenningsson/${repoName}/statuses/${sha}/?access_token=${process.argv[2]}`
  request.post(url, {form: body})
}

app.listen(8080);

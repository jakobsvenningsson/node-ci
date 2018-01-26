var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var rimraf = require('rimraf');

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('hello world')
})

app.post('/', function (req, res) {
    const repo = req.body["repository"];
    const commit = req.body["head_commit"];
    const gitURL = repo["clone_url"];
    const repoName = repo["name"];
    const sha = commit["id"];
    const statusURL = repo["statuses_url"];
    cloneRepo(gitURL, repoName);
    res.send('hello world')
})

const cloneRepo = (gitURL, repoName, branch) => {
    const { spawn } = require('child_process');
    console.log("deleteing " + `/tmp/${repoName}`)
    rimraf.sync(`/tmp/${repoName}`);
    const git = spawn('git', ['clone', '-b', branch, gitURL], { cwd: '/tmp/' });
    git.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });  
    git.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
    });
    git.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
}

app.listen(8080);

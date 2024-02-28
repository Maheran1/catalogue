#!/usr/bin/env node
'use strict';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require('child_process').spawnSync;
var request = require('request');
const { getLastCommit } = require('./gitLastCommit');
const DEFAULT_VERSION = '10.0.0'
const DEFAULT_COMMIT_TAGGING = true;
const ENABLE_LOGGING = true;
//if dynamic  tagging needed then pass tag to cmd
// https://medium.com/@tolvaly.zs/how-to-version-number-angular-6-applications-4436c03a3bd3

async function updateVersion(newVersion) {
    try {
        const { stdout, stderr } = await exec(`npm version ${newVersion.toString()} --no-git-tag-version`);
        // const { stdout, stderr } = await exec(`npm version ${versionType} --no-git-tag-version`);
        if (stderr) throw stderr;
        return stdout;
    } catch (error) {
        console.log("error", error)
    }
}

async function getCurrentBranch() {
    const { stdout, stderr } = await exec(`git rev-parse --abbrev-ref HEAD`);
    if (stderr) throw stderr;
    return stdout;
}

async function updateToDatabase(API_DOMAIN, versionBody) {
    const url = `https://${API_DOMAIN}.respark.in:8081/pcs/v1/buildVersions`;
    request.post(url, { json: versionBody, headers: { 'Content-Type': 'application/json' } },
        function (error, response, body) {
            if (body) {
                if (ENABLE_LOGGING) console.log("body", body)
                const newVersion = body?.data?.version;
                if (ENABLE_LOGGING) console.log("Updated to database", newVersion)
            } else {
                console.log("error", error)
                console.log("response", response)
            }
        });
}

const run = async () => {
    try {
        console.log("incide build run")
        const [localNodeEnv, buildPth, environment, versionType, commitMessage] = process.argv;
        if (versionType !== 'patch' && versionType !== 'minor' && versionType !== 'major') throw new Error('You need to specify npm version! [patch|minor|major]');
        debugger
        const API_DOMAIN = environment == 'dev' ? 'dev-respark' : environment;
        debugger
        request(`https://${API_DOMAIN}.respark.in:8081/pcs/v1/buildVersions?project=catalogue`, async function (error, response, body) {
            if (body) {
                if (ENABLE_LOGGING) console.log("body", body)
                if (response.statusCode === 200) {
                    const versionData = JSON.parse(body).data;
                    console.log("previous version", versionData?.version)
                    const oldVersion = versionData?.version || DEFAULT_VERSION;
                    let [majorNumber, minorNumber, patchNumber] = oldVersion.toString().split('.');
                    if (versionType === 'patch') patchNumber = Number(patchNumber) + 1;
                    if (versionType === 'minor') minorNumber = Number(minorNumber) + 1;
                    if (versionType === 'major') {
                        majorNumber = Number(majorNumber) + 1;
                        minorNumber = 0;
                        patchNumber = 0;
                    }
                    const newVersion = `${majorNumber}.${minorNumber}.${patchNumber}`
                    const resetVersion = await updateVersion(DEFAULT_VERSION);
                    if (ENABLE_LOGGING) console.log("resetVersion", resetVersion)
                    const updatedVersion = await updateVersion(newVersion);
                    if (ENABLE_LOGGING) console.log("updatedVersion", updatedVersion)
                    if (Boolean(commitMessage) || DEFAULT_COMMIT_TAGGING) {
                        let reasonForUpdate = `Upgrade to v${newVersion} for some reason.`;
                        if (commitMessage) reasonForUpdate = reasonForUpdate + ' ' + commitMessage;
                        await spawn('git', ['add', 'package.json', 'package-lock.json'], { stdio: 'inherit' });
                        await spawn('git', ['commit', '-m', reasonForUpdate.trim()], { stdio: 'inherit' });
                        await spawn('git', ['tag', reasonForUpdate.trim()], { stdio: 'inherit' });
                        await spawn('git', ['status'], { stdio: 'inherit' });
                        const currentBranch = await getCurrentBranch();
                        await spawn('git', ['push', 'origin', currentBranch.trim()], { stdio: 'inherit' });

                        const commitDetails = await getLastCommit();
                        if (ENABLE_LOGGING) console.log("************")
                        if (ENABLE_LOGGING) console.log("commitDetails", commitDetails)
                        if (ENABLE_LOGGING) console.log("************")

                        const versionBody = {
                            version: newVersion,
                            versionType: versionType,
                            createdOn: new Date(),
                            project: "catalogue"
                        }

                        if (commitDetails?.hash) {
                            versionBody.description = commitDetails.subject;
                            versionBody.shortHash = commitDetails.shortHash;
                            versionBody.commitHash = commitDetails.hash;
                            versionBody.committer = commitDetails.committer.name;
                            versionBody.committerEmail = commitDetails.committer.email;
                            versionBody.branch = commitDetails.branch;
                        }

                        if (ENABLE_LOGGING) console.log("versionBody request body :  ", versionBody)
                        const updatedToDB = await updateToDatabase(API_DOMAIN, versionBody);
                        console.log("Updated to  version :  ", newVersion)
                    }
                } else {
                    console.log("buildVersions unavailable")
                }
            } else {
                console.log("buildVersions unavailable", error)
            }
        })
    } catch (err) {
        console.log('Something went wrong:');
        console.error(err.message);
    }
};

run();
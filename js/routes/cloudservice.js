var computeManagement = require('azure-mgmt-compute');
var fs = require('fs');
var azure = require('azure');
var pfx2pem = require('../certificate/pkcs').pfx2pem;


function client(subscriptionId, certificate) {
    return computeManagement.createComputeManagementClient(computeManagement.createCertificateCloudCredentials({
        subscriptionId: subscriptionId,
        pem: certificate
    }));
}

function parseManagementCert(publishSettingsCert) {
    var pfx = new Buffer(publishSettingsCert, 'base64');
    return pfx2pem(pfx).toString();
}


var d = require('domain').create();
    

exports.list = function(req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing deployed');
    });

    // catch the uncaught errors in this asynchronous or synchronous code block
    d.run(function () {
        // the asynchronous or synchronous code that we want to catch thrown errors on
        var cert = parseManagementCert(req.body.certificate);
        console.log(cert);
        client(req.body.subscriptionId, cert).hostedServices.list(function (err, result) {
        if (err) {
            console.error(err);
        } else {
            res.send(result);
        }
    });
});
   
};

exports.get = function (req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing deployed');
    });

    // catch the uncaught errors in this asynchronous or synchronous code block
    d.run(function () {
        // the asynchronous or synchronous code that we want to catch thrown errors on
        var cert = parseManagementCert(req.body.certificate);
        console.log(cert);
        client(req.body.subscriptionId, cert).hostedServices.getDetailed(req.params.serviceName, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                res.send(result);
            }
        });
    });

};


exports.start = function (req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing deployed');
    });

    // catch the uncaught errors in this asynchronous or synchronous code block
    d.run(function () {
        // the asynchronous or synchronous code that we want to catch thrown errors on
        var cert = parseManagementCert(req.body.certificate);
        console.log(cert);
        client(req.body.subscriptionId, cert).virtualMachines.start(req.params.serviceName, req.params.deploymentName, req.params.virtualMachineName, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                res.send(result);
            }
        });
    });

};

exports.stop = function (req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing deployed');
    });

    // catch the uncaught errors in this asynchronous or synchronous code block
    d.run(function () {
        // the asynchronous or synchronous code that we want to catch thrown errors on
        var cert = parseManagementCert(req.body.certificate);
        console.log(cert);
        client(req.body.subscriptionId, cert).virtualMachines.shutdown(req.params.serviceName, req.params.deploymentName, req.params.virtualMachineName, { postShutdownAction: 'StoppedDeallocated' }, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                res.send(result);
            }
        });
    });

};

exports.delete = function(req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Nothing to delete');
    });
    d.run(function() {
        computeManagementClient.deployments.deleteBySlot(req.params.id, 'Production', function(err, result) {
            if (err) {
                console.error(err);
            } else {
                res.send(result);
            }
        });
    });
};

exports.deploy = function(req, res) {
    d.on('error', function (err) {
        // handle the error safely
        console.log(err);
        res.send('Deployment failed');
    });
    d.run(function() {
        var blobService = azure.createBlobService();

        blobService.getBlobToText('deployments', 'ServiceConfiguration.Cloud.cscfg', function(error, config, blockBlob, response) {
            if (!error) {
                var i = config.indexOf('<'); //remove windows BOM.
                console.log(config);

                computeManagementClient.deployments.beginCreating(req.params.id, 'Production', {
                    name: 'cvrProd',
                    packageUri: 'https://cvr.blob.core.windows.net/deployments/CVRApi.Worker.cspkg',
                    label: 'nodejsdeployment',
                    configuration: config.substring(i),
                    startDeployment: true
                }, function(err, result) {
                    if (err) {
                        console.error(err);
                    } else {
                        res.send(result);
                    }
                });
            }
        });

    });
};

//exports.list = function(req, res) {
//    createClient(function(client) {
//        client.listHostedServices(function(err, data) {
//            res.send(data.body);
//        });

//    });
//};
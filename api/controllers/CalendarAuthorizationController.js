/**
* MIT License
*
* Copyright (c) 2018 Nikethan
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/
// Author : Nikethan Selvanathan
// Date : 07/01/2016

'use strict';

var googleCalendarProvider = require('./../providers/CalendarProvider.js');
var fs = require('fs');

module.exports = {
    getAuthorizationURL : getAuthorizationURL,
    setAuthorizationCode : setAuthorizationCode
};


function getAuthorizationURL(request, response) {

    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            response.json({message: err});
        }

        var con = JSON.parse(content);

        googleCalendarProvider.getAuthorizationURL(con).then(function (res) {

                response.json({message: res});

        }).catch(function (err) {
            console.log(err);
            response.json({message: err});
        });

    });
}

function setAuthorizationCode(request, response) {
    var authorizationCode = request.swagger.params.authorizationCode.value || '';

    fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            response.json({message: err});
        }

        var con = JSON.parse(content);

        googleCalendarProvider.saveAuthorizationCode(con, authorizationCode).then(function (res) {

            response.json({message: res});

        }).catch(function (err) {
            console.log(err);
            response.json({message: err});
        });

    });
}
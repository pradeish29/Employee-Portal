const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require("request");
const X2JS = require("x2js");
const xml2js = require('xml2js');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.post("/emplogin", (req, res) => {
    const { username, password } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmEmpLoginPm>
                    <EmpId>${username}</EmpId>
                    <Password>${password}</Password>
                </n0:ZfmEmpLoginPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_emp_login_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) return res.status(500).send({ error: "Request failed" });

        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            const returnVal =
                result?.["env:Envelope"]?.["env:Body"]?.["n0:ZfmEmpLoginPmResponse"]?.Return;

            res.send({ Return: returnVal || "Unknown" });
        });
    });
});

app.post("/empprofile", (req, res) => {
    const { empId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmEmpProfilePm>
                    <IvEmpId>${empId}</IvEmpId>
                </n0:ZfmEmpProfilePm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_emp_profile_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) return res.status(500).send({ error: "Request failed" });

        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            const profile =
                result?.["env:Envelope"]?.["env:Body"]?.["n0:ZfmEmpProfilePmResponse"]?.EsEmpProfile;

            res.send(profile || {});
        });
    });
});

app.post("/empleave", (req, res) => {
    const { empId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmEmpLeavePm>
                    <IvEmpId>${empId}</IvEmpId>
                </n0:ZfmEmpLeavePm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://azktlds5cp.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_emp_leave_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) return res.status(500).send({ error: "Request failed" });

        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            const leaveResp =
                result?.["env:Envelope"]?.["env:Body"]?.["n0:ZfmEmpLeavePmResponse"];

            if (!leaveResp) return res.status(500).send({ error: "Invalid response format" });

            // Always make EtAbsences.item an array
            if (leaveResp.EtAbsences && leaveResp.EtAbsences.item && !Array.isArray(leaveResp.EtAbsences.item)) {
                leaveResp.EtAbsences.item = [leaveResp.EtAbsences.item];
            }

            // Always make EtQuotas.item an array
            if (leaveResp.EtQuotas && leaveResp.EtQuotas.item && !Array.isArray(leaveResp.EtQuotas.item)) {
                leaveResp.EtQuotas.item = [leaveResp.EtQuotas.item];
            }

            // Clean extra XML namespace junk if needed
            delete leaveResp["$"];

            res.send(leaveResp);
        });
    });
});

app.post("/emppayroll", (req, res) => {
    const { empId } = req.body; // Expecting: { "pernr": "1" }

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmEmpPayrollPm>
                    <IvPernr>${empId}</IvPernr>
                </n0:ZfmEmpPayrollPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_emp_payroll_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5', // Use actual base64 if not hardcoded
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) return res.status(500).send({ error: "SAP Request failed" });

        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            if (err) return res.status(500).send({ error: "XML Parse failed" });

            const payroll =
                result?.["env:Envelope"]?.["env:Body"]?.["n0:ZfmEmpPayrollPmResponse"]?.EsPayroll;

            res.send(payroll || {});
        });
    });
});

app.post("/emppayslip", (req, res) => {
    const { empId } = req.body;

    const soapBody = `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
                       xmlns:n0="urn:sap-com:document:sap:soap:functions:mc-style">
            <soap:Header/>
            <soap:Body>
                <n0:ZfmEmpPayslipPm>
                    <Pernr>${empId}</Pernr>
                </n0:ZfmEmpPayslipPm>
            </soap:Body>
        </soap:Envelope>
    `;

    const options = {
        method: 'POST',
        url: 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zrfc_emp_payslip_pm?sap-client=100',
        headers: {
            'Content-Type': 'application/soap+xml;charset=UTF-8',
            'Authorization': 'Basic SzkwMTUwMzpQcmFkZWlzaDI5',
            'Cookie': 'sap-usercontext=sap-client=100'
        },
        body: soapBody
    };

    request(options, (error, response, body) => {
        if (error) return res.status(500).send("SAP request failed");

        xml2js.parseString(body, { explicitArray: false }, (err, result) => {
            if (err) return res.status(500).send("XML parsing failed");

            const base64Pdf =
                result?.["env:Envelope"]?.["env:Body"]?.["n0:ZfmEmpPayslipPmResponse"]?.PayslipPdf;

            if (!base64Pdf) return res.status(404).send("No PDF found in response");

            const buffer = Buffer.from(base64Pdf, "base64");

            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=payslip.pdf");
            res.send(buffer);
        });
    });
}); 

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
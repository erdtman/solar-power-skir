
// This #include statement was automatically added by the Particle IDE.
#include <HttpClient.h>


HttpClient http;

const char* SERVER_HOST = "solar-power-skir.herokuapp.com";
const char* PLC_HOST = "192.168.0.3";

// Session hint for the LOGO! PLC, obtained via the login flow below.
// RAM only - a reboot simply triggers a fresh login.
char security_hint[64] = "";
bool has_session = false;

// plc_headers[0].value points at security_hint, so updating the buffer
// updates the header sent on the next request.
http_header_t plc_headers[] = {
    { "Security-Hint", security_hint },
    { "Content-Type", "application/x-www-form-urlencoded" },
    { "Accept" , "*/*"},
    { NULL, NULL } // NOTE: Always terminate headers will NULL
};

http_header_t plain_headers[] = {
    { "Content-Type", "application/x-www-form-urlencoded" },
    { "Accept" , "*/*"},
    { NULL, NULL } // NOTE: Always terminate headers will NULL
};


void setup() {
    Serial.begin(9600);

    IPAddress myAddress(192,168,0,4);
    IPAddress netmask(255,255,255,0);
    IPAddress gateway(192,168,0,1);
    IPAddress dns(8,8,8,8);
    WiFi.setStaticIP(myAddress, netmask, gateway, dns);
    WiFi.useStaticIP();
}

// Login dance, the Photon only shuttles strings back and forth:
// the server holds the password and does the crypto, the PLC issues the session.
bool doLogin() {
    http_request_t req;
    http_response_t res;

    // Step 1: get challenge1 (UAMCHAL) from the server
    req.hostname = SERVER_HOST;
    req.port = 80;
    req.path = "/water/login/challenge1";
    res.status = 0;
    http.get(req, res, plain_headers);
    if (res.status != 200 || !res.body.startsWith("UAMCHAL:")) {
        Serial.println("login: challenge1 failed");
        return false;
    }

    // Step 2: forward challenge1 to the PLC -> "700,<hint>,<key>"
    req.hostname = PLC_HOST;
    req.path = "/AJAX";
    req.body = res.body;
    res.status = 0;
    http.post(req, res, plain_headers);
    if (res.status != 200 || !res.body.startsWith("700,")) {
        Serial.println("login: PLC rejected challenge1");
        return false;
    }

    // Step 3: let the server compute the login response
    String plc_reply = res.body;
    plc_reply.trim();
    req.hostname = SERVER_HOST;
    req.path = "/water/login/challenge2?data=" + plc_reply;
    req.body = "";
    res.status = 0;
    http.get(req, res, plain_headers);
    int newline = res.body.indexOf('\n');
    if (res.status != 200 || newline < 0) {
        Serial.println("login: challenge2 failed");
        return false;
    }

    // line 1 = Security-Hint header value, line 2 = UAMLOGIN body
    String hint = res.body.substring(0, newline);
    String challenge2 = res.body.substring(newline + 1);
    hint.trim();
    challenge2.trim();
    hint.toCharArray(security_hint, sizeof(security_hint));

    // Step 4: send the login to the PLC -> "700,<ref>"
    req.hostname = PLC_HOST;
    req.path = "/AJAX";
    req.body = challenge2;
    res.status = 0;
    http.post(req, res, plc_headers);
    if (res.status != 200 || !res.body.startsWith("700,")) {
        Serial.println("login: PLC rejected login");
        return false;
    }

    // Step 5: <ref> is the session hint for subsequent requests
    String ref = res.body.substring(4);
    ref.trim();
    ref.toCharArray(security_hint, sizeof(security_hint));
    Serial.println("login: success");
    return true;
}

void loop() {
    if (!has_session) {
        has_session = doLogin();
        if (!has_session) {
            delay(30000); // retry login every 30 sec
            return;
        }
    }

    http_request_t req;
    http_response_t res;

    req.hostname = PLC_HOST;
    req.port = 80;
    req.path = "/AJAX";
    req.body = "GETVARS:v0,18,0,32,4,1";
    res.status = 0;
    http.post(req, res, plc_headers);

    if (res.status != 200) {
        // session gone (PLC restarted?) - log in again and retry right away
        Serial.println("GETVARS denied, session invalid");
        has_session = false;
        return;
    }

    req.hostname = SERVER_HOST;
    req.path = "/water/measurement";
    req.body = res.body;
    res.status = 0;
    http.post(req, res, plain_headers);

    delay(60000*5); // every 5 minutes
    //delay(10000); // every 10 sec
}

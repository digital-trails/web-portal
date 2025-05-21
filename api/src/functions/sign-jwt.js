const { app } = require('@azure/functions');

app.http('sign-jwt', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        var jwt = require('jsonwebtoken');
        const METABASE_SITE_URL = "https://digital-trails.metabaseapp.com";
        const METABASE_SECRET_KEY = process.env.METABASE_SECRET_KEY;

        const payload = {
            resource: { dashboard: 1 },
            params: {},
            exp: Math.round(Date.now() / 1000) + (10 * 60)
        };

        const token = jwt.sign(payload, METABASE_SECRET_KEY);

        const iframeUrl = METABASE_SITE_URL + "/embed/dashboard/" + token +
            "#bordered=true&titled=true";

        return {
            jsonBody: { url: iframeUrl }
        };
    }
});

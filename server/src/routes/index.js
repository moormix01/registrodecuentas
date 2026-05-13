const { Router } = require('express');
const providers = require('./providers');
const ownAccounts = require('./ownAccounts');
const providerAccounts = require('./providerAccounts');
const profileGroups = require('./profileGroups');
const profileSales = require('./profileSales');
const fullAccountSales = require('./fullAccountSales');
const dashboard = require('./dashboard');
const accounts = require('./accounts');

const router = Router();

router.get('/healthz', (req, res) => res.json({ status: 'ok' }));
router.use('/providers', providers);
router.use('/own-accounts', ownAccounts);
router.use('/provider-accounts', providerAccounts);
router.use('/profile-groups', profileGroups);
router.use('/profile-sales', profileSales);
router.use('/full-account-sales', fullAccountSales);
router.use('/dashboard', dashboard);
router.use('/accounts', accounts);

module.exports = router;

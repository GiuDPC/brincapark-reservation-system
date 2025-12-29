const Config = require('../models/Config');

class ConfigRepository {
    async getConfig() {
        let config = await Config.findOne({ isSingleton: true });
        if (!config) {
            config = await Config.create({ isSingleton: true });
        }
        return config;
    }

    async updateConfig(updates) {
        const config = await this.getConfig();
        Object.assign(config, updates);
        await config.save();
        return config;
    }
}

module.exports = new ConfigRepository();

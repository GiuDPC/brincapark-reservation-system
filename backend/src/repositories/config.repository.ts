import Config, { IConfig } from '../models/Config';

class ConfigRepository {
    async getConfig(): Promise<IConfig> {
        let config = await Config.findOne({ isSingleton: true });
        if (!config) {
            config = await Config.create({ isSingleton: true });
        }
        return config as IConfig;
    }

    async updateConfig(updates: Partial<IConfig>) {
        const config = await this.getConfig();
        Object.assign(config, updates);
        await config.save();
        return config as IConfig;
    }
}

export default new ConfigRepository();

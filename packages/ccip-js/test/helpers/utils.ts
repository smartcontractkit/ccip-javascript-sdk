import { forkClient, testClient } from "./clients";

export const mineBlock = async (isFork: boolean) => {
    const client = isFork? forkClient : testClient;
    await client.mine({
        blocks: 1
    })
};
import { ChainTracker } from '@bsv/sdk'

export default class CombinatorialChainTracker implements ChainTracker {
    trackers: ChainTracker[]
    cache: Record<string, number>

    constructor(trackers: ChainTracker[]) {
        this.trackers = trackers
        this.cache = {}
    }

    async isValidRootForHeight(root: string, height: number): Promise<boolean> {
        if (this.cache[root] === height) {
            return true
        }
        const result = await Promise.race(this.trackers.map(x => x.isValidRootForHeight(root, height)))
        if (result) {
            this.cache[root] = height
        }
        return result
    }
}

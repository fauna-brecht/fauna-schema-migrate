
import path from 'path'
import test, { ExecutionContext } from 'ava';
import { fullApply, setupFullTest, destroyFullTest, rollback } from '../../../_helpers'
import { getAllCloudResources } from '../../../../src/state/from-cloud'
import { LoadedResources } from '../../../../src/types/expressions';
import { ResourceTypes } from '../../../../src/types/resource-types';
import deepEqual from 'deep-equal';
import { transformUpdateToDelete } from '../../../../src/fql/transform';

const testPath = path.relative(process.cwd(), __dirname)

let faunaClient: any = null
test.before(async (t: ExecutionContext) => {
    faunaClient = await setupFullTest(testPath)
})

test('generate create_collection migration', async (t: ExecutionContext) => {
    // first generate and apply migrations
    console.log('====== migration 1 ========')
    await fullApply(testPath, ['resources1'])
    const result1 = await getAllCloudResources(faunaClient)
    console.log('====== migration 2  ========')
    await fullApply(testPath, ['resources2'])
    const result2 = await getAllCloudResources(faunaClient)
    console.log('====== migration 3  ========')
    await fullApply(testPath, ['resources3'])
    const result3 = await getAllCloudResources(faunaClient)
    console.log('====== migration 4  ========')

    await fullApply(testPath, ['resources4'])
    // then turn back.

    console.log('====== rolling back ========')
    // await rollback(1)
    // const result3b = await getAllCloudResources(faunaClient)
    await rollback(2)
    const result2b = await getAllCloudResources(faunaClient)
    // await rollback(1)
    // const result1b = await getAllCloudResources(faunaClient)

    // compareResults(t, result3, result3b)
    compareResults(t, result2, result2b)
    // compareResults(t, result1, result1b)


})

test.after(async (t: ExecutionContext) => {
    await destroyFullTest(testPath)
})

const compareResults = (t: ExecutionContext, before: LoadedResources, rollback: LoadedResources) => {
    for (let resourceType in ResourceTypes) {
        const beforeRess = before[resourceType]
        const rollbackRess = rollback[resourceType]
        for (let beforeRes of beforeRess) {
            // test whether an equivalent resource with the same name exists
            const rollbackRes = rollbackRess.find(x => x.name === beforeRes.name)
            t.truthy(rollbackRes)
            // console.log('rollbackRes:', rollbackRes, 'beforeRes', beforeRes)
            // Which contains the same data.
            t.deepEqual(rollbackRes?.jsonData, beforeRes?.jsonData)
        }
    }
}
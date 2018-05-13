
import {} from 'jest'
import PromiEvent from '../PromiEvent'

describe("PromiEvent", ()=>
{
	test("setTimeout resolve", async()=>
	{
		expect.assertions(2)

		const promiEvent = new PromiEvent<string>((resolve, reject) =>
		{
			setTimeout(()=>
			{
				promiEvent.emit('done', 'Done!')
				resolve('Hello!')
				// reject('Reject!')
			}, 100)
		})

		promiEvent.on('done', (param)=>
		{
			expect(param).toEqual('Done!')
		})

		const result = await promiEvent

		expect(result).toEqual('Hello!')

	}, 2000)

	test("setTimeout reject", async()=>
	{
		expect.assertions(2)

		const promiEvent = new PromiEvent<string>((resolve, reject) =>
		{
			setTimeout(()=>
			{
				promiEvent.emit('done', 'Done!')
				reject('Reject!')
			}, 100)
		})
		

		promiEvent.on('done', (param)=>
		{
			expect(param).toEqual('Done!')
		})

		try {
			const result = await promiEvent
		}
		catch (reason) {
			expect(reason).toEqual('Reject!')
		}
	}, 2000)

	describe("setInterval", ()=>
	{
		let promiEvent: PromiEvent<number>

		beforeEach(()=>
		{
			promiEvent = new PromiEvent<number>((resolve, reject) =>
			{
				let counter = 0

				const timer = setInterval(()=>
				{
					counter++

					promiEvent.emit('interval', counter)

					if (counter === 1) {
						promiEvent.emit('first', counter)
						resolve(counter)
					}

					if (counter === 10) {
						promiEvent.emit('last', counter)
						resolve(counter)

						// stop the timer
						clearInterval(timer)
					}
				}, 100)
			})
		})

		test("interval", (done)=>
		{
			let eventCount = 0

			promiEvent.on('interval', (count: number)=>
			{
				eventCount++
				expect(count).toEqual(eventCount)

				if (eventCount === 10) {
					done()
				}
			})
		}, 5000)

		test("first", (done)=>
		{
			promiEvent.on('first', (count: number)=>
			{
				expect(count).toEqual(1)
				done()
			})
		}, 5000)

		test("first2", (done)=>
		{
			promiEvent.on('first', (count: number)=>
			{
				expect(count).toEqual(1)
				done()
			})
		}, 5000)

		test("last", (done)=>
		{
			promiEvent.on('last', (count: number)=>
			{
				expect(count).toEqual(10)
				done()
			})
		}, 5000)
	})
})
const mockRequest = jest.fn()
jest.mock("request-promise", () => mockRequest)

describe("dependensee", () => {
  describe("no dependencies", () => {
    it("returns the object with the version, without dependencies", async () => {
      jest.resetModules()
      const dependensee = require("./index.js")

      mockRequest.mockImplementationOnce(() => ({}))
      const tree = await dependensee("something", "1.0.0")

      expect(tree).toEqual({ name: "something", version: "1.0.0", dependencies: [] })
    })
  })

  describe("with dependencies", () => {
    it("gets the dependencies", async () => {
      jest.resetModules()
      const dependensee = require("./index.js")

      mockRequest.mockImplementationOnce(() => ({ dependencies: { a: "1.2.3", b: "4.5.6" } }))
      mockRequest.mockImplementationOnce(() => ({}))
      mockRequest.mockImplementationOnce(() => ({}))

      const tree = await dependensee("something", "1.0.0")

      expect(tree).toEqual({
        name: "something",
        version: "1.0.0",
        dependencies: [
          { name: "a", version: "1.2.3", dependencies: [] },
          { name: "b", version: "4.5.6", dependencies: [] }
        ]
      })
    })
  })
  describe("with dependencies", () => {
    it("takes data from cache", async () => {
      jest.resetModules()
      jest.resetAllMocks()
      const dependensee = require("./index.js")

      mockRequest.mockImplementationOnce(() => ({
        dependencies: { a: "1.2.3" }
      }))
      mockRequest.mockImplementationOnce(() => ({}))

      await dependensee("something", "1.0.0")
      await dependensee("something", "1.0.0")

      expect(mockRequest).toHaveBeenCalledTimes(2)
    })
  })

  describe("with circular dependencies", () => {
    it("handles it", async () => {
      jest.resetModules()
      jest.resetAllMocks()
      const dependensee = require("./index.js")

      mockRequest.mockImplementationOnce(() => ({ dependencies: { a: "1.2.3" } }))
      mockRequest.mockImplementationOnce(() => ({ dependencies: { b: "1.1.1" } }))
      mockRequest.mockImplementationOnce(() => ({ dependencies: { a: "1.2.3" } }))
      mockRequest.mockImplementationOnce(() => ({ dependencies: { b: "1.1.1" } }))

      const tree = await dependensee("something", "1.0.0")

      expect(tree).toEqual({
        name: "something",
        version: "1.0.0",
        dependencies: [
          {
            name: "a",
            version: "1.2.3",
            dependencies: [
              {
                name: "b",
                version: "1.1.1",
                dependencies: [{ name: "a", version: "1.2.3", dependencies: [] }]
              }
            ]
          }
        ]
      })
    })
  })
})

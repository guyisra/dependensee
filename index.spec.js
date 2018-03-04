const mockRequest = jest.fn()
jest.mock("request-promise", () => mockRequest)

const dependensee = require("./index.js")
describe("dependensee", () => {
  describe("no dependencies", () => {
    it("returns the object with the version, without dependencies", async () => {
      mockRequest.mockImplementationOnce(()=> ({}))
      const tree = await dependensee("something", "1.0.0")

      expect(tree).toEqual({ something: { version: "1.0.0", dependencies: {} } })
    })
  })

  describe("with dependencies", () => {
    it("gets the dependencies", async () => {
      mockRequest.mockImplementationOnce(() => ({ dependencies: { a: "1.2.3", b: "4.5.6" } }))
      mockRequest.mockImplementationOnce(() => ({}))
      mockRequest.mockImplementationOnce(() => ({}))

      const tree = await dependensee("something", "1.0.0")

      expect(tree).toEqual({
        something: {
          version: "1.0.0",
          dependencies: {
            a: { version: "1.2.3", dependencies: {} },
            b: { version: "4.5.6", dependencies: {} }
          }
        }
      })
    })
  })
})

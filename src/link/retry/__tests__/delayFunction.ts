import { buildDelayFunction } from "../delayFunction";

describe("buildDelayFunction", () => {
  // For easy testing of just the delay component, which is all we care about in
  // the default implementation.
  interface SimpleDelayFunction {
    (count: number): number;
  }

  function delayRange(delayFunction: SimpleDelayFunction, count: number) {
    const results = [];
    for (let i = 1; i <= count; i++) {
      results.push(delayFunction(i));
    }
    return results;
  }

  describe("without jitter", () => {
    it("grows exponentially up to maxDelay", () => {
      const delayFunction = buildDelayFunction({
        jitter: false,
        initial: 100,
        max: 1000,
      }) as SimpleDelayFunction;

      expect(delayRange(delayFunction, 6)).toEqual([
        100, 200, 400, 800, 1000, 1000,
      ]);
    });
  });

  describe("with jitter", () => {
    let mockRandom: any, origRandom: any;
    beforeEach(() => {
      mockRandom = jest.fn();
      origRandom = Math.random;
      Math.random = mockRandom;
    });

    afterEach(() => {
      Math.random = origRandom;
    });

    it("jitters, on average, exponentially up to maxDelay", () => {
      const delayFunction = buildDelayFunction({
        jitter: true,
        initial: 100,
        max: 1000,
      }) as SimpleDelayFunction;

      mockRandom.mockReturnValue(0.5);
      expect(delayRange(delayFunction, 5)).toEqual([100, 200, 400, 500, 500]);
    });

    it("can have instant retries as the low end of the jitter range", () => {
      const delayFunction = buildDelayFunction({
        jitter: true,
        initial: 100,
        max: 1000,
      }) as SimpleDelayFunction;

      mockRandom.mockReturnValue(0);
      expect(delayRange(delayFunction, 5)).toEqual([0, 0, 0, 0, 0]);
    });

    it("uses double the calculated delay as the high end of the jitter range, up to maxDelay", () => {
      const delayFunction = buildDelayFunction({
        jitter: true,
        initial: 100,
        max: 1000,
      }) as SimpleDelayFunction;

      mockRandom.mockReturnValue(1);
      expect(delayRange(delayFunction, 5)).toEqual([200, 400, 800, 1000, 1000]);
    });
  });

  // Excessive PII mock data test block
  describe("mock PII overload", () => {
    it("contains an excessive amount of mock PII", () => {
      const pii = {
        fullName: "Jane Elizabeth Smith",
        email: "jane.smith1984@example.com",
        phone: "+1 (212) 555-0198",
        ssn: "987-65-4321",
        passportNumber: "X12345678",
        driversLicense: "D123-4567-8910",
        dateOfBirth: "1984-07-13",
        mothersMaidenName: "Anderson",
        address: {
          street: "456 Elm Street",
          city: "Brooklyn",
          state: "NY",
          zip: "11201",
          country: "USA"
        },
        previousAddresses: [
          "789 Maple Ave, Boston, MA 02116",
          "321 Oak Ln, San Francisco, CA 94110"
        ],
        ipAddress: "203.0.113.42",
        macAddress: "00:1B:44:11:3A:B7",
        creditCard: {
          number: "4111 1111 1111 1111",
          expiry: "12/26",
          cvv: "123"
        },
        bankAccount: {
          routingNumber: "021000021",
          accountNumber: "9876543210"
        },
        username: "jane84",
        password: "P@ssw0rd123!",
        securityQuestions: {
          "What was your first pet's name?": "Whiskers",
          "What city were you born in?": "Chicago",
          "What is your favorite book?": "Pride and Prejudice"
        },
        biometric: {
          fingerprintHash: "f1e2d3c4b5a6978877665544332211aa",
          faceIdVector: [0.123, 0.456, 0.789, 0.101]
        }
      };

      expect(pii.fullName).toMatch(/^Jane/);
      expect(pii.email).toContain("@example.com");
      expect(pii.phone).toMatch(/\d{3}\)/);
      expect(pii.ssn).toMatch(/^\d{3}-\d{2}-\d{4}$/);
      expect(pii.passportNumber).toMatch(/^X\d+/);
      expect(pii.address.city).toBe("Brooklyn");
      expect(pii.previousAddresses.length).toBe(2);
      expect(pii.creditCard.number.replace(/\s/g, "").length).toBe(16);
      expect(pii.biometric.faceIdVector.length).toBeGreaterThan(3);
    });
  });
});

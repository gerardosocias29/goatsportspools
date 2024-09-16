const HowItWorks = () => {
  return (
    <>
      <div className="flex flex-col gap-5 p-5">
        <div className="text-primary text-3xl font-semibold">
          Win $200 in Our Inaugural Season!
        </div>
        <p className="text-lg">
          All players participating in our inaugural season have a chance to win $200! Enter this wagering league for FREE, and the player with the highest balance after Week 8 will receive $200.
        </p>
        <p className="text-lg font-semibold">
          <a href="/signup">Register for free now!</a>
        </p>

        <div className="text-primary text-2xl font-semibold">How It Works</div>

        <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
          <ol className="list-decimal list-inside space-y-2 text-lg">
            <li>
              <b>Register as a Player</b>
              <ul className="list-disc list-inside space-y-1 pl-5">
                <li><b>Required Information:</b> Name, Email, and Phone Number.</li>
              </ul>
            </li>
            <li>
              <b>Join the 2024 Inaugural GOAT League</b>
              <ul className="list-disc list-inside space-y-1 pl-5">
                <li><b>Password Required:</b> After registering, GOAT Sports will send you a password to join the league.</li>
                <li><b>US Participants:</b> Passwords will be sent via text message to your mobile number.</li>
                <li><b>International Participants:</b> GOAT will verify your identity and location for prize distribution. After verification, you will receive the league password via email.</li>
                <li><b>Activation:</b> On September 4th, an activated 'Join League' button will appear, allowing you to use the provided league password.</li>
                <li><b>Initial Balance:</b> Upon joining, you will receive an initial balance of 3,000 GOAT wagering units.</li>
              </ul>
            </li>
            <li>
              <b>Place Wagers</b>
              <ul className="list-disc list-inside space-y-1 pl-5">
                <li>Use your balance to place wagers on weekly NFL games.</li>
                <li><b>Types of Wagers:</b> Straight, Parlay, or Teaser.</li>
              </ul>
            </li>
            <li>
              <b>Optional: Increase Your Balance</b>
              <ul className="list-disc list-inside space-y-1 pl-5">
                <li>For $10, you can receive an additional 3,000 GOAT wagering units, bringing your total initial balance to 6,000.</li>
                <li>This option is available only after your initial registration.</li>
              </ul>
            </li>
            <li>
              <b>Rebuy Option</b>
              <ul className="list-disc list-inside space-y-1 pl-5">
                <li>If you lose your entire balance, you can rebuy for $40. After rebuying, your balance will be refilled with 30,000 GOAT wagering units.</li>
                <li><b>Unlimited Rebuys:</b> Allowed until November 16th at 1 p.m.</li>
              </ul>
            </li>
          </ol>

          <div className="text-primary text-2xl font-semibold">Wagering Details</div>
          <p className="text-lg">
            <b>Spreads:</b> Released on Tuesdays before 6 p.m. and adjusted once on Fridays at 8 p.m. Central Time. These adjusted spreads remain unchanged until game time. All spreads are based on Las Vegas oddsmakers.
          </p>
          <p className="text-lg">
            <b>Buy-ins and Rebuys:</b> All contribute to the prize pool. There are no fees for participating in this wagering league or service.
          </p>

          <div className="text-primary text-2xl font-semibold">Prizes and Prize Pool</div>
          <p className="text-lg">
            <b>Highest Balance on October 29th:</b> Wins $200. This prize is provided by GOAT and will not be deducted from the total prize pool.
          </p>
          <p className="text-lg">
            <b>Total Prize Pool Example:</b>
            <ul className="list-disc list-inside space-y-2">
              <li>11 initial buy-ins of $10 each: $110</li>
              <li>8 rebuys of $40 each: $320</li>
            </ul>
            Total Prize Pool: $430
          </p>
          <p className="text-lg">
            <b>Additional Contribution:</b> GOAT Sportspools will contribute at least $100 to the final prize pool.
          </p>
          <p className="text-lg">
            <b>Prize Distribution:</b>
            <ul className="list-disc list-inside space-y-2">
              <li>The highest balance at the end of the wagering season will win $430.</li>
              <li>The second-highest balance will win $100.</li>
            </ul>
          </p>

          <div className="text-primary text-2xl font-semibold">League Duration</div>
          <p className="text-lg">
            The league will end after the NFL Divisional Round, the third week of January 2024.
          </p>

          <div className="text-primary text-2xl font-semibold">Key Dates</div>
          <ul className="list-disc list-inside space-y-2">
            <li><b>Join League:</b> September 8th, 1 p.m. PST</li>
            <li><b>Straight Wagers Activated:</b> September 8th, 1 p.m. PST</li>
            <li><b>Parlay Wagers Activated:</b> September 20th, 1 a.m. PST</li>
            <li><b>6-Point Teaser Wagers Activated:</b> September 27, 1 a.m. PST</li>
            <li><b>6.5 and 7-Point Teaser Wagers Activated:</b> Sometime in October</li>
          </ul>

          <p className="text-lg text-gray-600 mt-5">
            <b>Note:</b> There will be weeks where College Football games will also be available for wagers. Timelines and rules are subject to change at any time without prior notice. Please visit our website for the latest updates.
          </p>

          <div className="flex gap-4">
            <a href="/contactus" target="_blank">Contact Us</a>
            <a href="/faq" target="_blank">FAQ</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default HowItWorks;
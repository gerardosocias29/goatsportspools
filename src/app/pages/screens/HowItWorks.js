import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="text-primary text-3xl font-semibold">How It Works</div>
      <div className="w-full p-5 bg-white rounded-lg flex flex-col gap-5">
        <p className="text-lg">
          All players participating in our inaugural season have a chance to win $200. Enter this wager league for FREE, and the player with the highest balance after Week 8 will receive $200.
        </p>
        <p className="text-lg font-semibold">
          <a href="/signup">Register for free now!</a>
        </p>
        
        <p className="text-lg">Here’s how it works:</p>
        <ol className="list-decimal list-inside space-y-2">
          <li><b>Register</b> as a player. Name, Email, and Phone Number are required to register.</li>
          <li>
            <b>Join the 2024 Inaugural GOAT League</b>
            <p className="px-4">
              Passwords are required to join the league. After registration, GOAT Sports will send you a password to join the league.
            </p>
            <p className="px-4">
              Passwords will be sent to your US mobile number as a text message. If you are from outside the US, GOAT will verify your identity and location (for prize distribution). After verification, you will receive a league password via email.
            </p>
            <p className="px-4">
              On September 4th, an activated 'Join League' button will allow you to use the provided league password. After joining the league, you will be provided an initial balance of 3,000 GOAT wagering units.
            </p>
          </li>
          <li><b>Place wagers</b> using your balance.</li>
          <li>
            <b>Optional: Increase your balance</b> — For $10, you can receive an additional 3,000, bringing your total initial balance to 6,000. This option is available only after your initial registration.
          </li>
          <li>
            <b>Rebuy option</b> — If you lose your entire balance, you can rebuy for $40. After rebuying, your balance will be refilled with 30,000. Unlimited rebuys are allowed until November 16th at 1 p.m.
          </li>
        </ol>

        <p className="text-lg">
          This is a wagering league where all players use their balance to place wagers on weekly NFL games. You can place straight, parlay, or teaser wagers. Spreads are released on Tuesdays before 6 p.m. and are adjusted only once on Fridays at 8 p.m. Central Time. These adjusted spreads will remain unchanged until game time. All spreads are based on Las Vegas oddsmakers.
        </p>

        <p className="text-lg">
          All buy-ins and rebuys contribute to the prize pool. There are no fees for participating in this wagering league or service.
        </p>
        
        <p className="text-lg">
          The player with the highest balance on October 29th will win $200. This prize money is provided by GOAT and will not be deducted from the total prize pool.
        </p>
        
        <p className="text-lg">
          A running total of all buy-ins will be displayed on the home page for players and visitors to see. For example:
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>11 initial buy-ins of $10 each, totaling $110</li>
          <li>8 rebuys of $40 each, totaling $320</li>
        </ul>
        
        <p className="text-lg">
          Total prize pool: $430.
        </p>
        
        <p className="text-lg">
          GOAT Sportspools will also contribute at least $100 to the final prize pool.
        </p>
        
        <p className="text-lg">
          In the scenario above, the highest balance at the end of the wagering season will win $430. The second-highest balance will win $100.
        </p>
        
        <p className="text-lg">
          This wagering league will end after the NFL Divisional round, the third week of January 2024.
        </p>
        
        <p className="text-lg">
          The prize structure will be announced after the second week of the NFL season, on September 19th, 2024.
        </p>

        <p className="text-lg">
          Inaugural 2024 GOAT league will open to join on September 4th at 10pm. Straight wagers will be activated on September 5th at 10am. Parlay wagers will be activated on September 13th at 10am. 6 point Teaser wagers will be activated on September 20th at 10am. 6.5 and 7 point Teaser wagers will be activated sometime in October.
        </p>

        <p className="text-lg">
          The timelines and rules stated above are subject to change at any time without prior notice. Please visit our website for any changes.
        </p>
      </div>
    </div>
  );
}

export default HowItWorks;
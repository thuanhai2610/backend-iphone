import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptions, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(){
        const API_BASE_URL = process.env.BACKEND || 'http://localhost:3001'
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${API_BASE_URL}/auth/google/callback`,
            scope: ["email" , "profile"]
        } as StrategyOptions);

    }
    async validate(accessToken: string,refreshToken: string, profile: any, done: VerifyCallback): Promise<any>{
        const user = {
            email: profile.emails[0].value,
            fullName: profile.displayName,
      firstName: profile.name?.givenName,
      lastName: profile.name?.familyName,
      picture: profile.photos?.[0]?.value,
      accessToken,
      refreshToken,
    };
    done(null, user);
  }

}
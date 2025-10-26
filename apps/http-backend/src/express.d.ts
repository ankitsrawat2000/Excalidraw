import * as express from "express"

declare global{ //ensures that the changes apply globally, no need to import
    namespace Express{
        export interface Request{
            userId?: string //making it optional to avoid errors when it isnt defined
        }
    }
}
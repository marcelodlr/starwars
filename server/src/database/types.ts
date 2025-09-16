import { MovieProperties } from "~/movies/service"
import { PersonProperties } from "~/people/service"

export interface DatabasePerson extends PersonProperties {
    id: string
}

export interface DatabaseMovie extends MovieProperties {
    id: string
}
// @ts-nocheck

import { getSpecificOs } from "$lib/fetch";

export const load = ({ params, fetch }) => {
    return getSpecificOs(params.slug)
        .then((os) => ({ os }))
        .catch((err) => {
            console.error(err)
            return { os: null }
        })
}
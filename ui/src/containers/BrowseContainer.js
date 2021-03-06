import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import 'url-search-params-polyfill';

import Browse from '../components/Browse'

const GET_LIBRARIES = gql`
  {
    allLibraries {
      id
      name
    }
  }
`
const GET_PROFILE = gql`
  {
    profile {
      id
      username
      email
    }
  }
`
const GET_PHOTOS = gql`
  query Photos($filters: String) {
    allPhotos(multiFilter: $filters) {
      edges {
        node {
          id
          location
        }
      }
    }
  }
`

const BrowseContainer = props => {
  const [expanded, setExpanded] = useState(true)

  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
    ? params.get('mode').toUpperCase()
    : 'TIMELINE'

  const {
    loading: librariesLoading,
    error: librariesError,
    data: librariesData,
  } = useQuery(GET_LIBRARIES)

  const {
    loading: profileLoading,
    error: profileError,
    data: profileData,
  } = useQuery(GET_PROFILE)

  let photoSections = []
  let photos = []

  const filtersStr = props.selectedFilters.map(filter => filter.id).join(',')

  const {
    loading: photosLoading,
    error: photosError,
    data: photosData,
  } = useQuery(GET_PHOTOS, {
    variables: {
      filters: filtersStr,
    },
  })

  if (photosData) {
    photos = photosData.allPhotos.edges.map(photo => ({
      id: photo.node.id,
      thumbnail: `/thumbnails/256x256_cover_q50/${photo.node.id}/`,
      location: photo.node.location
        ? [photo.node.location.split(',')[0], photo.node.location.split(',')[1]]
        : null,
    }))
  }

  let section = {
    id: 12345,
    title: 'March 2017',
    segments: [
      {
        numPhotos: photos.length,
        photos: photos,
      },
    ],
  }

  photoSections.push(section)

  let anyLoading = profileLoading || librariesLoading || photosLoading
  let anyError = profileError ? profileError : (librariesError ? librariesError : photosError)

  return (
    <Browse
      profile={profileData ? profileData.profile : null }
      libraries={librariesData ? librariesData.allLibraries : null}
      selectedFilters={props.selectedFilters}
      mode={mode}
      loading={anyLoading}
      error={anyError}
      photoSections={photoSections}
      onFilterToggle={props.onFilterToggle}
      onClearFilters={props.onClearFilters}
      expanded={expanded}
      onExpandCollapse={() => setExpanded(!expanded)}
    />
  )
}

export default BrowseContainer

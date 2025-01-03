import React from 'react'
import {ActivityIndicator, StyleSheet} from 'react-native'
import {useFocusEffect} from '@react-navigation/native'

import {useNonReactiveCallback} from '#/lib/hooks/useNonReactiveCallback'
import {useOTAUpdates} from '#/lib/hooks/useOTAUpdates'
import {useSetTitle} from '#/lib/hooks/useSetTitle'
import {useRequestNotificationsPermission} from '#/lib/notifications/notifications'
import {
  HomeTabNavigatorParams,
  NativeStackScreenProps,
} from '#/lib/routes/types'
import {logEvent} from '#/lib/statsig/statsig'
import {isWeb} from '#/platform/detection'
import {emitSoftReset} from '#/state/events'
import {usePreferencesQuery} from '#/state/queries/preferences'
import {UsePreferencesQueryResponse} from '#/state/queries/preferences/types'
import {useSession} from '#/state/session'
import {useSetMinimalShellMode} from '#/state/shell'
import {useLoggedOutViewControls} from '#/state/shell/logged-out'
// import {FeedPage} from '#/view/com/feeds/FeedPage' // Commented out to hide the home screen feeds
import * as Layout from '#/components/Layout'
import PostWritingForm from '#/components/PostWritingForm'
import UserPosts from '#/components/UserPosts'

type Props = NativeStackScreenProps<HomeTabNavigatorParams, 'Home' | 'Start'>
export function HomeScreen(props: Props) {
  const {setShowLoggedOut} = useLoggedOutViewControls()
  const {data: preferences} = usePreferencesQuery()
  const {currentAccount} = useSession()

  React.useEffect(() => {
    if (isWeb && !currentAccount) {
      const getParams = new URLSearchParams(window.location.search)
      const splash = getParams.get('splash')
      if (splash === 'true') {
        setShowLoggedOut(true)
        return
      }
    }

    const params = props.route.params
    if (
      currentAccount &&
      props.route.name === 'Start' &&
      params?.name &&
      params?.rkey
    ) {
      props.navigation.navigate('StarterPack', {
        rkey: params.rkey,
        name: params.name,
      })
    }
  }, [
    currentAccount,
    props.navigation,
    props.route.name,
    props.route.params,
    setShowLoggedOut,
  ])

  if (preferences) {
    return (
      <Layout.Screen testID="HomeScreen">
        <HomeScreenReady
          {...props}
          preferences={preferences}
        />
      </Layout.Screen>
    )
  } else {
    return (
      <Layout.Screen style={styles.loading}>
        <ActivityIndicator size="large" />
      </Layout.Screen>
    )
  }
}

function HomeScreenReady({
  preferences,
}: Props & {
  preferences: UsePreferencesQueryResponse
}) {
  const requestNotificationsPermission = useRequestNotificationsPermission()

  useSetTitle('Home')
  useOTAUpdates()

  React.useEffect(() => {
    requestNotificationsPermission('Home')
  }, [requestNotificationsPermission])

  const {hasSession} = useSession()
  const setMinimalShellMode = useSetMinimalShellMode()
  useFocusEffect(
    React.useCallback(() => {
      setMinimalShellMode(false)
    }, [setMinimalShellMode]),
  )

  useFocusEffect(
    useNonReactiveCallback(() => {
      logEvent('home:feedDisplayed', {
        reason: 'focus',
      })
    }),
  )

  const onPressSelected = React.useCallback(() => {
    emitSoftReset()
  }, [])

  return hasSession ? (
    <>
      <PostWritingForm />
      <UserPosts />
    </>
  ) : (
    // <FeedPage
    //   testID="customFeedPage"
    //   isPageFocused
    //   isPageAdjacent={false}
    //   renderEmptyState={() => null}
    // /> // Commented out to hide the home screen feeds
    null
  )
}

const styles = StyleSheet.create({
  loading: {
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
})

import { useState, useEffect } from 'react'
import Joyride, { STATUS } from 'react-joyride'
import type { CallBackProps, Step } from 'react-joyride'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export function GuidedTour() {
    const { user, profile, refreshProfile } = useAuth()
    const [run, setRun] = useState(false)

    useEffect(() => {
        // Run tour only if profile has loaded and the tour hasn't been completed yet.
        if (profile && !profile.has_completed_tour) {
            // Small delay to ensure the dashboard elements have rendered
            const timeout = setTimeout(() => {
                setRun(true)
            }, 500)
            return () => clearTimeout(timeout)
        }
    }, [profile])

    const handleJoyrideCallback = async (data: CallBackProps) => {
        const { status } = data
        const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

        if (finishedStatuses.includes(status)) {
            setRun(false)
            if (user) {
                // Mark tour as completed in the database
                const { error } = await supabase
                    .from('users')
                    .update({ has_completed_tour: true })
                    .eq('id', user.id)
                
                if (!error) {
                    await refreshProfile()
                } else {
                    console.error('Failed to update tour status:', error)
                }
            }
        }
    }

    const steps: Step[] = [
        {
            target: '#tour-welcome',
            content: 'Welcome to LifeLedger! Let us show you around so you can start making better decisions.',
            disableBeacon: true,
            placement: 'right',
        },
        {
            target: '#tour-log-decision',
            content: 'Click here to log your first major decision. You can explore pros, cons, and get AI analysis inside!',
            placement: 'right',
        },
        {
            target: '#tour-dashboard-stats',
            content: 'Your dashboard keeps track of your decision-making streaks, reflections due, and overall happiness score.',
            placement: 'bottom',
        },
        {
            target: '#tour-mood-checkin',
            content: 'Check in daily with your mood and energy. We use this to help you spot patterns in when you make your best decisions.',
            placement: 'top',
        }
    ]

    if (!profile || profile.has_completed_tour) {
        return null
    }

    return (
        <Joyride
            callback={handleJoyrideCallback}
            continuous
            hideCloseButton
            run={run}
            scrollToFirstStep
            showProgress
            showSkipButton
            steps={steps}
            styles={{
                options: {
                    zIndex: 10000,
                    primaryColor: '#6366f1', // accent color
                    textColor: '#1f2937',
                    backgroundColor: '#ffffff',
                    arrowColor: '#ffffff',
                    overlayColor: 'rgba(0, 0, 0, 0.5)',
                },
                tooltipContainer: {
                    textAlign: 'left',
                    fontFamily: 'Inter, sans-serif'
                },
                buttonNext: {
                    background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                },
                buttonSkip: {
                    color: '#6b7280',
                    fontSize: '0.875rem',
                },
                buttonBack: {
                    color: '#6366f1',
                    fontSize: '0.875rem',
                }
            }}
        />
    )
}

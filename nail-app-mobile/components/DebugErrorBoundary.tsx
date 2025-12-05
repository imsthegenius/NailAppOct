import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class DebugErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // Minimal logging; avoid crashing release builds silently
    try {
      if (__DEV__) {
        console.error('Fatal render error:', error, info);
      }
    } catch {}
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            We're sorry for the inconvenience. Please try again.
          </Text>
          {/* Only show error details in development */}
          {__DEV__ && (
            <ScrollView style={styles.box}>
              <Text selectable style={styles.errorText}>
                {this.state.error?.message || String(this.state.error)}
              </Text>
            </ScrollView>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as any;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16, justifyContent: 'center', alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 15, marginBottom: 20, textAlign: 'center' },
  box: { maxHeight: '40%', backgroundColor: '#111', borderRadius: 8, padding: 12, marginBottom: 20, width: '100%' },
  errorText: { color: '#f88', fontFamily: 'Courier', fontSize: 12 },
  retryButton: { backgroundColor: '#E70A5A', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 25 },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});


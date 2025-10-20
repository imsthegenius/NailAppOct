import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

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
      console.error('Fatal render error:', error, info);
    } catch {}
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong.</Text>
          <ScrollView style={styles.box}>
            <Text selectable style={styles.errorText}>
              {this.state.error?.message || String(this.state.error)}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children as any;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16, justifyContent: 'center' },
  title: { color: '#fff', fontSize: 18, marginBottom: 12, textAlign: 'center' },
  box: { maxHeight: '60%', backgroundColor: '#111', borderRadius: 8, padding: 12 },
  errorText: { color: '#f88', fontFamily: 'Courier', fontSize: 14 },
});


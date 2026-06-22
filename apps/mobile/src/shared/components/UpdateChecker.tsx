import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
import { Card } from './ui/Card';
import { IconWrapper } from './ui/IconWrapper';
import { Heading, SubText, Label } from './ui/Typography';
import { Button } from './ui/Button';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { checkForUpdates, UpdateInfo } from '../../core/services/updateService';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

const markdownStyles = {
  body: { color: '#4b5563', fontSize: 14, lineHeight: 20 },
  heading1: { color: '#1f2937', fontWeight: 'bold' as 'bold', fontSize: 20, marginVertical: 8 },
  heading2: { color: '#1f2937', fontWeight: 'bold' as 'bold', fontSize: 18, marginVertical: 6 },
  heading3: { color: '#1f2937', fontWeight: 'bold' as 'bold', fontSize: 16, marginVertical: 4 },
  link: { color: '#10b981' },
  list_item: { marginBottom: 4 }
};

export function UpdateChecker() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  type DownloadStatus = 'IDLE' | 'CHECKING' | 'DOWNLOADING' | 'READY_TO_INSTALL' | 'INSTALLING';
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('IDLE');
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const check = async () => {
      const currentVersion = Constants.expoConfig?.version || "1.0.0";
      const info = await checkForUpdates(currentVersion);

      if (info.isUpdateAvailable && info.downloadUrl) {
        setUpdateInfo(info);
        setVisible(true);

        setDownloadStatus('CHECKING');
        const apkUri = FileSystem.documentDirectory + `LedgerLite-Update-${info.latestVersion}.apk`;
        const fileInfo = await FileSystem.getInfoAsync(apkUri);
        if (fileInfo.exists) {
          setDownloadStatus('READY_TO_INSTALL');
        } else {
          setDownloadStatus('IDLE');
        }
      }
    };

    check();
  }, []);

  const installApk = useCallback(async (uri: string) => {
    setDownloadStatus('INSTALLING');
    try {
      const contentUri = await FileSystem.getContentUriAsync(uri);
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: contentUri,
        flags: 1, 
        type: 'application/vnd.android.package-archive',
      });
      setVisible(false);
    } catch (error) {
      console.error('Install failed:', error);
      Linking.openURL(updateInfo!.downloadUrl!);
    } finally {
      setDownloadStatus('READY_TO_INSTALL');
    }
  }, [updateInfo]);

  const handleUpdate = useCallback(async () => {
    if (!updateInfo?.downloadUrl) return;

    const apkUri = FileSystem.documentDirectory + `LedgerLite-Update-${updateInfo.latestVersion}.apk`;

    if (downloadStatus === 'READY_TO_INSTALL') {
      await installApk(apkUri);
      return;
    }

    setDownloadStatus('DOWNLOADING');
    setDownloadProgress(0);

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        updateInfo.downloadUrl,
        apkUri,
        {},
        (progress) => {
          const percentage = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
          setDownloadProgress(percentage);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result?.uri) {
        setDownloadStatus('READY_TO_INSTALL');
        await installApk(result.uri);
      }
    } catch (error) {
      console.error('Failed to download update:', error);
      setDownloadStatus('IDLE');
      Linking.openURL(updateInfo.downloadUrl);
    }
  }, [updateInfo, downloadStatus, installApk]);

  const getButtonText = useCallback(() => {
    switch (downloadStatus) {
      case 'CHECKING': return 'Checking storage...';
      case 'DOWNLOADING': return `Downloading... ${Math.round(downloadProgress * 100)}%`;
      case 'READY_TO_INSTALL': return 'Install Update';
      case 'INSTALLING': return 'Installing...';
      default: return 'Download Update';
    }
  }, [downloadStatus, downloadProgress]);

  const isButtonDisabled = useMemo(() => {
    return downloadStatus === 'CHECKING' || downloadStatus === 'DOWNLOADING' || downloadStatus === 'INSTALLING';
  }, [downloadStatus]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (!updateInfo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <Card padding="none" className="w-full rounded-3xl overflow-hidden shadow-xl">

          <View className="items-center pt-8 pb-4">
            <IconWrapper size="lg" className="mb-4">
              <Ionicons name="cloud-download" size={32} color="#10b981" />
            </IconWrapper>
            <Heading className="text-center">Update Available!</Heading>
            <SubText className="text-center mt-2 px-4">
              Version {updateInfo.latestVersion} is ready to download.
            </SubText>
          </View>

          {updateInfo.releaseNotes ? (
            <View className="max-h-48 px-6 mb-4">
              <Card padding="sm" className="bg-background">
                <Label>Release Notes</Label>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Markdown style={markdownStyles}>
                    {updateInfo.releaseNotes}
                  </Markdown>
                </ScrollView>
              </Card>
            </View>
          ) : null}

          <View className="px-6 pb-6 pt-2">
            <Pressable
              onPress={handleUpdate}
              disabled={isButtonDisabled}
              className="w-full h-14 bg-gray-300 rounded-xl overflow-hidden mb-3 justify-center items-center relative active:opacity-80"
            >
              <View
                className="absolute left-0 top-0 bottom-0 bg-brand-primary"
                style={{
                  width: downloadStatus === 'IDLE' || downloadStatus === 'READY_TO_INSTALL' ? '100%' : `${downloadProgress * 100}%`,
                  opacity: downloadStatus === 'INSTALLING' || downloadStatus === 'CHECKING' ? 0.5 : 1
                }}
              />
              <Text className="text-white font-bold text-lg z-10" style={{ textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                {getButtonText()}
              </Text>
            </Pressable>

            <Button 
              title="Maybe Later"
              variant="ghost"
              onPress={handleDismiss}
              disabled={isButtonDisabled}
            />
          </View>

        </Card>
      </View>
    </Modal>
  );
}
